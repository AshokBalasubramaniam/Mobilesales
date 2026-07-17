import { useState, type MouseEvent } from "react";
import clsx from "clsx";
import {
  Check,
  CheckCheck,
  MapPin,
  PhoneMissed,
  PhoneOff,
  Play,
  Video,
} from "lucide-react";
import { formatDateTime } from "../../utils/format";
import { formatCurrency } from "../../utils/format";
import Button from "../common/Button";
import type { Message, OfferStatus } from "../../types/models";

export type RespondOfferHandler = (
  messageId: string,
  status: OfferStatus,
) => void;

const classes = {
  offerCard: "rounded-xl border border-brand-200 bg-white p-3",
  offerLabel: "text-xs text-gray-500",
  offerAmount: "text-lg font-bold text-brand-700",
  offerStatusBase: "mt-1 text-xs font-medium capitalize",
  offerStatusAccepted: "text-green-600",
  offerStatusRejected: "text-red-500",
  offerActions: "mt-2 flex gap-2",

  voiceContainer: "flex items-center gap-2",
  voicePlayButton: "rounded-full bg-brand-600 p-2 text-white",
  voicePlayIcon: "size-3.5",
  voiceLabel: "text-xs text-gray-400",

  systemEvent:
    "flex items-center justify-center gap-1.5 py-1 text-xs text-gray-400",
  systemIcon: "size-3.5",

  row: "flex",
  justifyEnd: "justify-end",
  justifyStart: "justify-start",
  bubbleWrapper: "max-w-xs sm:max-w-sm",
  itemsEnd: "items-end",
  itemsStart: "items-start",
  senderLabel: "mb-0.5 px-1 text-[11px] font-medium text-brand-600",
  bubbleBase: "rounded-2xl px-3.5 py-2 text-sm",
  bubbleOffer: "bg-transparent p-0",
  bubbleOwn: "rounded-br-sm bg-brand-600 text-white",
  bubbleOther: "rounded-bl-sm bg-gray-100",
  image: "max-h-60 rounded-lg",
  locationLink: "flex items-center gap-1.5 underline",
  locationIcon: "size-4",
  footer: "mt-0.5 flex items-center gap-1 text-[10px] text-gray-400",
  readIcon: "size-3 text-brand-500",
  unreadIcon: "size-3",
};

interface OfferBubbleProps {
  message: Message;
  isOwn: boolean;
  onRespond: RespondOfferHandler;
}

const OfferBubble = ({ message, isOwn, onRespond }: OfferBubbleProps) => {
  if (!message.offer) return null;
  const { amount, status } = message.offer;
  return (
    <div className={classes.offerCard}>
      <p className={classes.offerLabel}>
        {isOwn ? "You offered" : "Offer received"}
      </p>
      <p className={classes.offerAmount}>{formatCurrency(amount)}</p>
      <p
        className={clsx(
          classes.offerStatusBase,
          status === "accepted" && classes.offerStatusAccepted,
          status === "rejected" && classes.offerStatusRejected,
        )}
      >
        {status}
      </p>
      {!isOwn && status === "pending" && (
        <div className={classes.offerActions}>
          <Button size="sm" onClick={() => onRespond(message._id, "accepted")}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onRespond(message._id, "rejected")}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
};

interface VoiceBubbleProps {
  url?: string;
}

const VoiceBubble = ({ url }: VoiceBubbleProps) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={classes.voiceContainer}>
      <button
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          const audio = e.currentTarget.nextSibling as HTMLAudioElement | null;
          if (!audio) return;
          playing ? audio.pause() : audio.play();
        }}
        className={classes.voicePlayButton}
      >
        <Play className={classes.voicePlayIcon} />
      </button>
      <audio
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <span className={classes.voiceLabel}>Voice message</span>
    </div>
  );
};

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderLabel?: string;
  onRespondOffer: RespondOfferHandler;
}

const MessageBubble = ({
  message,
  isOwn,
  senderLabel,
  onRespondOffer,
}: MessageBubbleProps) => {
  if (message.type === "system" || message.type === "video_call_event") {
    const Icon =
      message.callEvent?.event === "missed"
        ? PhoneMissed
        : message.callEvent?.event === "declined"
          ? PhoneOff
          : Video;
    return (
      <div className={classes.systemEvent}>
        <Icon className={classes.systemIcon} />
        {message.type === "video_call_event"
          ? `Video call ${message.callEvent?.event}`
          : message.content}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        classes.row,
        isOwn ? classes.justifyEnd : classes.justifyStart,
      )}
    >
      <div
        className={clsx(
          classes.bubbleWrapper,
          isOwn ? classes.itemsEnd : classes.itemsStart,
        )}
      >
        {senderLabel && <p className={classes.senderLabel}>{senderLabel}</p>}
        <div
          className={clsx(
            classes.bubbleBase,
            message.type === "offer"
              ? classes.bubbleOffer
              : isOwn
                ? classes.bubbleOwn
                : classes.bubbleOther,
          )}
        >
          {message.type === "text" && message.content}
          {message.type === "image" && (
            <img
              src={message.mediaUrl}
              alt="Shared"
              className={classes.image}
            />
          )}
          {message.type === "voice" && <VoiceBubble url={message.mediaUrl} />}
          {message.type === "location" && (
            <a
              href={`https://maps.google.com/?q=${message.location?.lat},${message.location?.lng}`}
              target="_blank"
              rel="noreferrer"
              className={classes.locationLink}
            >
              <MapPin className={classes.locationIcon} />{" "}
              {message.location?.address || "Shared location"}
            </a>
          )}
          {message.type === "offer" && (
            <OfferBubble
              message={message}
              isOwn={isOwn}
              onRespond={onRespondOffer}
            />
          )}
        </div>
        <div
          className={clsx(
            classes.footer,
            isOwn ? classes.justifyEnd : classes.justifyStart,
          )}
        >
          {formatDateTime(message.createdAt)}
          {isOwn &&
            (message.isRead ? (
              <CheckCheck className={classes.readIcon} />
            ) : (
              <Check className={classes.unreadIcon} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
