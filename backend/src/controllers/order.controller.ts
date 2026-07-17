import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import Order from "../models/Order";
import Mobile from "../models/Mobile";
import ApiError from "../utils/ApiError";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import generateOrderNumber from "../utils/generateOrderNumber";
import { notify } from "../services/notification.service";
import { calculateDiscount, findValidCoupon } from "./coupon.controller";
import {
  MOBILE_STATUS,
  ORDER_STATUS,
  DELIVERY_STATUS,
  DELIVERY_TYPE,
  NOTIFICATION_TYPE,
  ROLES,
} from "../config/constants";
import type {
  DeliveryType,
  DeliveryStatus,
  OrderStatus,
} from "../types/constants";
import type { IOrder, IOrderDeliveryAddress, ICoupon } from "../types/models";
import type { AuthenticatedUser } from "../types/express";
import type { PaginationQuery } from "../types/common";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

const DELIVERY_CHARGES: Record<DeliveryType, number> = {
  [DELIVERY_TYPE.HOME_DELIVERY]: 199,
  [DELIVERY_TYPE.LOCAL_DELIVERY]: 49,
  [DELIVERY_TYPE.STORE_PICKUP]: 0,
};

const assertAccess = (
  order: Pick<IOrder, "buyer" | "seller">,
  user: AuthenticatedUser,
): void => {
  const isParty =
    order.buyer.toString() === user._id.toString() ||
    order.seller.toString() === user._id.toString() ||
    user.role === ROLES.ADMIN;
  if (!isParty)
    throw ApiError.forbidden("You do not have access to this order");
};

interface CreateOrderBody {
  mobileId: string;
  deliveryType: DeliveryType;
  deliveryAddress?: IOrderDeliveryAddress;
  couponCode?: string;
}

export const createOrder = async (
  req: Request<Record<string, never>, unknown, CreateOrderBody>,
  res: Response,
) => {
  try {
    const { mobileId, deliveryType, deliveryAddress, couponCode } = req.body;

    const mobile = await Mobile.findById(mobileId);
    if (!mobile)
      return res
        .status(404)
        .json({ flag: "error", message: "Listing not found" });
    if (mobile.status !== MOBILE_STATUS.ACTIVE) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "This listing is not available for purchase",
        });
    }
    if (mobile.seller.toString() === req.user!._id.toString()) {
      return res
        .status(400)
        .json({ flag: "error", message: "You cannot buy your own listing" });
    }

    const itemPrice = mobile.price;
    const deliveryCharge = DELIVERY_CHARGES[deliveryType] ?? 0;
    let discount = 0;
    let coupon: ICoupon | null = null;

    if (couponCode) {
      coupon = await findValidCoupon(couponCode, req.user!._id);
      discount = calculateDiscount(coupon, itemPrice + deliveryCharge);
    }

    const totalAmount = Math.max(itemPrice + deliveryCharge - discount, 0);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: req.user!._id,
      seller: mobile.seller,
      mobile: mobile._id,
      pricing: {
        itemPrice,
        deliveryCharge,
        discount,
        couponCode: coupon?.code,
        totalAmount,
      },
      deliveryType,
      deliveryAddress,
      trackingHistory: [
        { status: DELIVERY_STATUS.PENDING, timestamp: new Date() },
      ],
    });

    if (coupon) {
      const usage = coupon.usedBy.find(
        (u) => u.user.toString() === req.user!._id.toString(),
      );
      if (usage) usage.count += 1;
      else coupon.usedBy.push({ user: req.user!._id, count: 1 });
      coupon.usedCount += 1;
      await coupon.save();
    }

    await notify({
      user: mobile.seller,
      type: NOTIFICATION_TYPE.ORDER,
      title: "New order received",
      message: `You have a new order for ${mobile.brand} ${mobile.model}`,
      data: { orderId: order._id },
    });

    res
      .status(201)
      .json({
        flag: "success",
        data: order,
        message: "Order placed successfully. Proceed to payment.",
      });
  } catch (error) {
    sendError(res, "create order", error);
  }
};

export const getOrder = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("mobile")
      .populate("buyer", "name avatar phone")
      .populate("seller", "name avatar phone")
      .populate("payment");
    if (!order)
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    assertAccess(order, req.user!);

    res.status(200).json({ flag: "success", data: order });
  } catch (error) {
    sendError(res, "fetch order", error);
  }
};

interface ListMyOrdersQuery extends PaginationQuery {
  orderStatus?: OrderStatus;
}

export const listMyOrdersAsBuyer = async (
  req: Request<Record<string, never>, unknown, unknown, ListMyOrdersQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<IOrder> = { buyer: req.user!._id };
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("mobile", "brand model images price")
        .populate("seller", "name avatar"),
      Order.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: orders,
        message: "Orders fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch buyer orders", error);
  }
};

export const listMyOrdersAsSeller = async (
  req: Request<Record<string, never>, unknown, unknown, ListMyOrdersQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<IOrder> = { seller: req.user!._id };
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("mobile", "brand model images price")
        .populate("buyer", "name avatar"),
      Order.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: orders,
        message: "Orders fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch seller orders", error);
  }
};

interface UpdateTrackingBody {
  status: DeliveryStatus;
  location?: string;
  note?: string;
  trackingNumber?: string;
  courierPartner?: string;
}

export const updateTracking = async (
  req: Request<{ id: string }, unknown, UpdateTrackingBody>,
  res: Response,
) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    if (
      order.seller.toString() !== req.user!._id.toString() &&
      req.user!.role !== ROLES.ADMIN
    ) {
      return res
        .status(403)
        .json({
          flag: "error",
          message: "Only the seller can update delivery tracking",
        });
    }

    const { status, location, note, trackingNumber, courierPartner } = req.body;
    order.pushTracking(status, location, note);
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierPartner) order.courierPartner = courierPartner;

    if (status === DELIVERY_STATUS.DELIVERED) {
      order.orderStatus = ORDER_STATUS.COMPLETED;
      await Mobile.updateOne(
        { _id: order.mobile },
        { status: MOBILE_STATUS.SOLD, soldAt: new Date(), soldTo: order.buyer },
      );
    }
    await order.save();

    await notify({
      user: order.buyer,
      type: NOTIFICATION_TYPE.ORDER,
      title: "Order update",
      message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, " ")}`,
      data: { orderId: order._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: order, message: "Tracking updated" });
  } catch (error) {
    sendError(res, "update order tracking", error);
  }
};

interface CancelOrderBody {
  reason?: string;
}

export const cancelOrder = async (
  req: Request<{ id: string }, unknown, CancelOrderBody>,
  res: Response,
) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ flag: "error", message: "Order not found" });
    assertAccess(order, req.user!);

    if (
      (
        [
          DELIVERY_STATUS.SHIPPED,
          DELIVERY_STATUS.OUT_FOR_DELIVERY,
          DELIVERY_STATUS.DELIVERED,
        ] as DeliveryStatus[]
      ).includes(order.deliveryStatus)
    ) {
      return res
        .status(400)
        .json({
          flag: "error",
          message: "Order can no longer be cancelled at this stage",
        });
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.pushTracking(DELIVERY_STATUS.CANCELLED, undefined, req.body.reason);
    order.cancelReason = req.body.reason;
    order.cancelledBy = req.user!._id;
    await order.save();

    const notifyTarget =
      order.buyer.toString() === req.user!._id.toString()
        ? order.seller
        : order.buyer;
    await notify({
      user: notifyTarget,
      type: NOTIFICATION_TYPE.ORDER,
      title: "Order cancelled",
      message: `Order ${order.orderNumber} was cancelled: ${req.body.reason}`,
      data: { orderId: order._id },
    });

    res
      .status(200)
      .json({ flag: "success", data: order, message: "Order cancelled" });
  } catch (error) {
    sendError(res, "cancel order", error);
  }
};

// --- Admin ---

interface ListAllOrdersQuery extends PaginationQuery {
  orderStatus?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
}

export const listAllOrders = async (
  req: Request<Record<string, never>, unknown, unknown, ListAllOrdersQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<IOrder> = {};
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;
    if (req.query.deliveryStatus)
      filter.deliveryStatus = req.query.deliveryStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyer", "name")
        .populate("seller", "name")
        .populate("mobile", "brand model"),
      Order.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        flag: "success",
        data: orders,
        message: "Orders fetched",
        meta: buildMeta({ page, limit, total }),
      });
  } catch (error) {
    sendError(res, "fetch all orders", error);
  }
};
