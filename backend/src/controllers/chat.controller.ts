import type { Request, Response } from "express";
import type { Types } from "mongoose";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import ApiError from "../utils/ApiError";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import * as storageService from "../services/storage.service";
import * as notificationService from "../services/notification.service";
import { emitToUser, emitToConversation, isUserOnline } from "../sockets";
import {
  MESSAGE_TYPE,
  OFFER_STATUS,
  NOTIFICATION_TYPE,
  ROLES,
} from "../config/constants";
import type { IConversation, IMessage } from "../types/models";
import type { AuthenticatedUser } from "../types/express";
import type { Populated } from "../types/common";
import type { OfferStatus } from "../types/constants";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface PopulatedChatParticipant {
  _id: Types.ObjectId;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
  lastSeen?: Date;
  sellerProfile?: { isVerified: boolean };
}

interface PopulatedChatMobile {
  _id: Types.ObjectId;
  brand: string;
  model: string;
  images: { url: string }[];
  price: number;
  status: string;
}

type ConversationWithParticipants = Populated<
  IConversation,
  { participants: PopulatedChatParticipant[]; mobile?: PopulatedChatMobile }
>;

// Not currently called anywhere in this module (pre-existing dead helper, kept as-is
// and exported so it isn't flagged as an unused local under the strict TS config).
export const otherParticipant = (
  conversation: IConversation,
  userId: Types.ObjectId,
): Types.ObjectId | undefined =>
  conversation.participants.find((p) => p.toString() !== userId.toString());

/**
 * Buyer/seller must be one of the two participants. Admins are not added to
 * `participants` (that would break the buyer/seller 1:1 unread-count and
 * "other participant" logic), but they can always read/reply for support and
 * dispute moderation.
 */
const assertAccess = (
  conversation: IConversation,
  user: AuthenticatedUser,
): void => {
  if (user.role === ROLES.ADMIN) return;
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === user._id.toString(),
  );
  if (!isParticipant)
    throw ApiError.forbidden("You are not part of this conversation");
};

const pushMessageToConversation = async (
  conversation: IConversation,
  message: IMessage,
  senderId: Types.ObjectId,
): Promise<void> => {
  const recipients = conversation.participants.filter(
    (p) => p.toString() !== senderId.toString(),
  );

  conversation.lastMessage = {
    text:
      message.type === MESSAGE_TYPE.TEXT
        ? message.content
        : `[${message.type}]`,
    type: message.type,
    sender: senderId,
    sentAt: message.createdAt,
  };
  recipients.forEach((recipient) => {
    const currentUnread =
      conversation.unreadCounts.get(recipient.toString()) || 0;
    conversation.unreadCounts.set(recipient.toString(), currentUnread + 1);
  });
  await conversation.save();

  // Broadcast to anyone with this conversation open (including the sender's own window
  // and admins viewing it for support) so it appears live without a refresh.
  emitToConversation(conversation._id, "message:new", message);

  await Promise.all(
    recipients.map(async (recipient) => {
      // Recipients also get it on their personal room so unread badges/conversation
      // list update even when they don't have this conversation open.
      emitToUser(recipient, "message:new", message);

      if (!isUserOnline(recipient.toString())) {
        await notificationService.notify({
          user: recipient,
          type: NOTIFICATION_TYPE.CHAT,
          title: "New message",
          message:
            message.type === MESSAGE_TYPE.TEXT
              ? (message.content ?? "").slice(0, 100)
              : `Sent you a${message.type === MESSAGE_TYPE.OFFER ? "n offer" : ` ${message.type}`}`,
          data: { conversationId: conversation._id },
        });
      }
    }),
  );
};

interface StartConversationBody {
  recipientId: string;
  mobileId?: string;
  message?: string;
}

export const startConversation = async (
  req: Request<Record<string, never>, unknown, StartConversationBody>,
  res: Response,
) => {
  try {
    const { recipientId, mobileId, message } = req.body;
    if (recipientId === req.user!._id.toString()) {
      return res.status(400).json({
        flag: "error",
        message: "Cannot start a conversation with yourself",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user!._id, recipientId] },
      ...(mobileId ? { mobile: mobileId } : { mobile: { $exists: false } }),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user!._id, recipientId],
        mobile: mobileId,
      });
    }

    if (message) {
      const created = await Message.create({
        conversation: conversation._id,
        sender: req.user!._id,
        type: MESSAGE_TYPE.TEXT,
        content: message,
      });
      await created.populate("sender", "name avatar role");
      await pushMessageToConversation(conversation, created, req.user!._id);
    }

    res.status(201).json({
      flag: "success",
      data: conversation,
      message: "Conversation started",
    });
  } catch (error) {
    sendError(res, "start conversation", error);
  }
};

interface PaginationOnlyQuery {
  page?: string;
  limit?: string;
}

export const listMyConversations = async (
  req: Request<Record<string, never>, unknown, unknown, PaginationOnlyQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { participants: req.user!._id };

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "name avatar lastSeen")
        .populate("mobile", "brand model images price status"),
      Conversation.countDocuments(filter),
    ]);

    const withMeta = conversations.map((c) => {
      const obj = c.toObject() as unknown as ConversationWithParticipants & {
        unreadCount?: number;
        otherParticipant?: PopulatedChatParticipant;
      };
      obj.unreadCount = c.unreadCounts.get(req.user!._id.toString()) || 0;
      obj.otherParticipant = obj.participants.find(
        (p) => p._id.toString() !== req.user!._id.toString(),
      );
      return obj;
    });

    res.status(200).json({
      flag: "success",
      data: withMeta,
      message: "Conversations fetched",
      meta: buildMeta({ page, limit, total }),
    });
  } catch (error) {
    sendError(res, "list your conversations", error);
  }
};

export const getConversationById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    await conversation.populate([
      {
        path: "participants",
        select: "name avatar email role sellerProfile.isVerified lastSeen",
      },
      { path: "mobile", select: "brand model images price status" },
    ]);

    res.status(200).json({ flag: "success", data: conversation });
  } catch (error) {
    sendError(res, "get conversation", error);
  }
};

// --- Admin: view/moderate any conversation for support and dispute resolution ---

export const listAllConversationsAdmin = async (
  req: Request<Record<string, never>, unknown, unknown, PaginationOnlyQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [conversations, total] = await Promise.all([
      Conversation.find({})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "name avatar email role")
        .populate("mobile", "brand model images price status"),
      Conversation.countDocuments({}),
    ]);

    res.status(200).json({
      flag: "success",
      data: conversations,
      message: "Conversations fetched",
      meta: buildMeta({ page, limit, total }),
    });
  } catch (error) {
    sendError(res, "list all conversations", error);
  }
};

interface MessageListQuery {
  page?: string;
  limit?: string;
}

export const getMessages = async (
  req: Request<{ id: string }, unknown, unknown, MessageListQuery>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    const { page, limit, skip } = getPagination(req.query, { limit: 30 });

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversation._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name avatar role"),
      Message.countDocuments({
        conversation: conversation._id,
        isDeleted: false,
      }),
    ]);

    res.status(200).json({
      flag: "success",
      data: messages.reverse(),
      message: "Messages fetched",
      meta: buildMeta({ page, limit, total }),
    });
  } catch (error) {
    sendError(res, "get messages", error);
  }
};

interface SendTextMessageBody {
  content: string;
}

export const sendTextMessage = async (
  req: Request<{ id: string }, unknown, SendTextMessageBody>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);
    if (conversation.isBlocked && req.user!.role !== ROLES.ADMIN) {
      return res
        .status(403)
        .json({ flag: "error", message: "This conversation is blocked" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!._id,
      type: MESSAGE_TYPE.TEXT,
      content: req.body.content,
    });
    await message.populate("sender", "name avatar role");

    await pushMessageToConversation(conversation, message, req.user!._id);

    res.status(201).json({ flag: "success", data: message });
  } catch (error) {
    sendError(res, "send message", error);
  }
};

export const sendMediaMessage = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);
    if (!req.file) {
      return res
        .status(400)
        .json({ flag: "error", message: "No file uploaded" });
    }

    const isVoice = req.file.mimetype.startsWith("audio/");
    const { url } = await storageService.uploadFile(req.file.buffer, {
      folder: isVoice ? "chat/voice" : "chat/images",
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!._id,
      type: isVoice ? MESSAGE_TYPE.VOICE : MESSAGE_TYPE.IMAGE,
      mediaUrl: url,
    });
    await message.populate("sender", "name avatar role");

    await pushMessageToConversation(conversation, message, req.user!._id);

    res.status(201).json({ flag: "success", data: message });
  } catch (error) {
    sendError(res, "send media message", error);
  }
};

interface SendOfferBody {
  amount: number;
}

export const sendOffer = async (
  req: Request<{ id: string }, unknown, SendOfferBody>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!._id,
      type: MESSAGE_TYPE.OFFER,
      offer: { amount: req.body.amount, status: OFFER_STATUS.PENDING },
    });
    await message.populate("sender", "name avatar role");

    await pushMessageToConversation(conversation, message, req.user!._id);

    res.status(201).json({ flag: "success", data: message });
  } catch (error) {
    sendError(res, "send offer", error);
  }
};

interface RespondToOfferBody {
  status: OfferStatus;
  counterAmount?: number;
}

export const respondToOffer = async (
  req: Request<{ id: string; messageId: string }, unknown, RespondToOfferBody>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    const offerMessage = await Message.findOne({
      _id: req.params.messageId,
      conversation: conversation._id,
      type: MESSAGE_TYPE.OFFER,
    });
    if (!offerMessage) {
      return res
        .status(404)
        .json({ flag: "error", message: "Offer not found" });
    }
    if (offerMessage.sender.toString() === req.user!._id.toString()) {
      return res
        .status(400)
        .json({ flag: "error", message: "Cannot respond to your own offer" });
    }

    offerMessage.offer!.status = req.body.status;
    await offerMessage.save();

    if (req.body.status === OFFER_STATUS.COUNTERED && req.body.counterAmount) {
      const counter = await Message.create({
        conversation: conversation._id,
        sender: req.user!._id,
        type: MESSAGE_TYPE.OFFER,
        offer: { amount: req.body.counterAmount, status: OFFER_STATUS.PENDING },
      });
      await counter.populate("sender", "name avatar role");
      await pushMessageToConversation(conversation, counter, req.user!._id);
    }

    emitToUser(offerMessage.sender, "offer:response", {
      messageId: offerMessage._id,
      status: req.body.status,
    });

    res.status(200).json({
      flag: "success",
      data: offerMessage,
      message: "Offer response recorded",
    });
  } catch (error) {
    sendError(res, "respond to offer", error);
  }
};

interface SendLocationBody {
  lat: number;
  lng: number;
  address?: string;
}

export const sendLocation = async (
  req: Request<{ id: string }, unknown, SendLocationBody>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!._id,
      type: MESSAGE_TYPE.LOCATION,
      location: req.body,
    });
    await message.populate("sender", "name avatar role");

    await pushMessageToConversation(conversation, message, req.user!._id);

    res.status(201).json({ flag: "success", data: message });
  } catch (error) {
    sendError(res, "send location", error);
  }
};

interface LogCallEventBody {
  event: "started" | "ended" | "missed" | "declined";
  durationSeconds?: number;
}

export const logCallEvent = async (
  req: Request<{ id: string }, unknown, LogCallEventBody>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!._id,
      type: MESSAGE_TYPE.VIDEO_CALL_EVENT,
      callEvent: {
        event: req.body.event,
        durationSeconds: req.body.durationSeconds,
      },
    });

    conversation.lastMessage = {
      text: `Video call ${req.body.event}`,
      type: message.type,
      sender: req.user!._id,
      sentAt: message.createdAt,
    };
    await conversation.save();

    res.status(201).json({ flag: "success", data: message });
  } catch (error) {
    sendError(res, "log call event", error);
  }
};

export const blockConversation = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res
        .status(404)
        .json({ flag: "error", message: "Conversation not found" });
    }
    assertAccess(conversation, req.user!);

    conversation.isBlocked = true;
    conversation.blockedBy = req.user!._id;
    await conversation.save();

    res.status(200).json({
      flag: "success",
      data: conversation,
      message: "Conversation blocked",
    });
  } catch (error) {
    sendError(res, "block conversation", error);
  }
};
