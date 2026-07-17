import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { MessageCircle, Star, Flag } from "lucide-react";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import OrderTrackingTimeline from "../../components/order/OrderTrackingTimeline";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Textarea from "../../components/common/Textarea";
import StarRating from "../../components/common/StarRating";
import Select from "../../components/common/Select";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  ORDER_STATUS_LABELS,
  DELIVERY_STATUS_STEPS,
} from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";
import type { DeliveryStatus, Order } from "../../types/models";

const extractError = (err: unknown, fallback: string): string =>
  (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) ||
  fallback;


const idOf = (field: string | { _id: string }): string =>
  typeof field === "string" ? field : field._id;

const classes = {
  container: "mx-auto max-w-3xl px-4 py-10",
  headerRow: "mb-6 flex items-center justify-between",
  orderTitle: "text-xl font-bold",
  orderDate: "text-sm text-gray-500",
  timelineCard: "mb-6 rounded-xl border border-gray-200 p-6",
  mobileCard:
    "mb-6 flex items-center gap-4 rounded-xl border border-gray-200 p-4",
  mobileImage: "size-16 rounded-lg bg-gray-100 object-cover",
  mobileInfo: "flex-1",
  mobileLink: "font-semibold hover:text-brand-600",
  soldBy: "text-sm text-gray-500",
  totalAmount: "font-bold",
  pricingCard:
    "mb-6 space-y-1 rounded-xl border border-gray-200 p-4 text-sm",
  pricingRow: "flex justify-between",
  pricingLabel: "text-gray-500",
  discountRow: "flex justify-between text-green-600",
  pricingTotalRow:
    "flex justify-between border-t border-gray-100 pt-2 font-bold",
  trackingCard:
    "mb-6 flex items-end gap-2 rounded-xl border border-gray-200 p-4",
  trackingSelect: "flex-1",
  actionsRow: "flex flex-wrap gap-2",
  modalForm: "space-y-4",
  modalSubmitButton: "w-full",
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<DeliveryStatus | "">("");

  const load = () => {
    if (!id) return Promise.resolve();
    return api
      .get<ApiResponse<Order>>(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data));
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [id]);

  if (loading || !order || !user) return <Spinner full />;

  const seller = typeof order.seller === "object" ? order.seller : undefined;
  const mobile = typeof order.mobile === "object" ? order.mobile : undefined;

  const isBuyer = idOf(order.buyer) === user._id;
  const isMySale = idOf(order.seller) === user._id;
  const canCancel =
    isBuyer && ["pending", "packed"].includes(order.deliveryStatus);
  const canReview = isBuyer && order.orderStatus === "completed";
  const canUpdateTracking = (isMySale && isSeller) || isAdmin;

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${id}/cancel`, { reason: "Cancelled by user" });
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(extractError(err, "Could not cancel order"));
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingStatus || !id) return;
    try {
      await api.patch(`/orders/${id}/tracking`, { status: trackingStatus });
      toast.success("Tracking updated");
      setTrackingStatus("");
      load();
    } catch (err) {
      toast.error(extractError(err, "Could not update tracking"));
    }
  };

  const handleChat = async () => {
    const recipientId = isBuyer ? idOf(order.seller) : idOf(order.buyer);
    const { data } = await api.post<ApiResponse<{ _id: string }>>(
      "/chat/conversations",
      { recipientId, mobileId: idOf(order.mobile) },
    );
    navigate(PATHS.chatConversation(data.data._id));
  };

  return (
    <div className={classes.container}>
      <div className={classes.headerRow}>
        <div>
          <h1 className={classes.orderTitle}>Order {order.orderNumber}</h1>
          <p className={classes.orderDate}>
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant={
            order.orderStatus === "completed"
              ? "green"
              : order.orderStatus === "cancelled"
                ? "red"
                : "brand"
          }
        >
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </Badge>
      </div>

      <div className={classes.timelineCard}>
        <OrderTrackingTimeline order={order} />
      </div>

      <div className={classes.mobileCard}>
        <img
          src={mobile?.images?.[0]?.url}
          alt=""
          className={classes.mobileImage}
        />
        <div className={classes.mobileInfo}>
          <Link
            to={PATHS.mobileDetail(mobile?._id)}
            className={classes.mobileLink}
          >
            {mobile?.brand} {mobile?.model}
          </Link>
          <p className={classes.soldBy}>Sold by {seller?.name}</p>
        </div>
        <span className={classes.totalAmount}>
          {formatCurrency(order.pricing.totalAmount)}
        </span>
      </div>

      <div className={classes.pricingCard}>
        <div className={classes.pricingRow}>
          <span className={classes.pricingLabel}>Item price</span>
          <span>{formatCurrency(order.pricing.itemPrice)}</span>
        </div>
        <div className={classes.pricingRow}>
          <span className={classes.pricingLabel}>Delivery charge</span>
          <span>{formatCurrency(order.pricing.deliveryCharge)}</span>
        </div>
        {order.pricing.discount > 0 && (
          <div className={classes.discountRow}>
            <span>Discount ({order.pricing.couponCode})</span>
            <span>-{formatCurrency(order.pricing.discount)}</span>
          </div>
        )}
        <div className={classes.pricingTotalRow}>
          <span>Total</span>
          <span>{formatCurrency(order.pricing.totalAmount)}</span>
        </div>
      </div>

      {canUpdateTracking &&
        order.orderStatus !== "cancelled" &&
        order.orderStatus !== "completed" && (
          <div className={classes.trackingCard}>
            <Select
              label="Update delivery status"
              value={trackingStatus}
              onChange={(e) =>
                setTrackingStatus(e.target.value as DeliveryStatus | "")
              }
              className={classes.trackingSelect}
            >
              <option value="">Select status</option>
              {DELIVERY_STATUS_STEPS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
            <Button onClick={handleUpdateTracking}>Update</Button>
          </div>
        )}

      <div className={classes.actionsRow}>
        <Button variant="secondary" icon={MessageCircle} onClick={handleChat}>
          {isBuyer ? "Chat Seller" : "Chat Buyer"}
        </Button>
        {canReview && (
          <Button
            variant="secondary"
            icon={Star}
            onClick={() => setReviewOpen(true)}
          >
            Write a Review
          </Button>
        )}
        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </Button>
        )}
        {(isBuyer || isMySale) && order.orderStatus !== "cancelled" && (
          <Button
            variant="ghost"
            icon={Flag}
            onClick={() => setDisputeOpen(true)}
          >
            Raise Dispute
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this order?"
        description="This action cannot be undone."
        confirmLabel="Cancel Order"
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        order={order}
        onDone={load}
      />
      <DisputeModal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        orderId={order._id}
      />
    </div>
  );
};

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onDone: () => void;
}

const ReviewModal = ({ open, onClose, order, onDone }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reviewForm = new FormData();
      reviewForm.append("order", order._id);
      reviewForm.append("mobile", idOf(order.mobile));
      reviewForm.append("seller", idOf(order.seller));
      reviewForm.append("rating", String(rating));
      reviewForm.append("comment", comment);
      await api.post("/reviews", reviewForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Review submitted");
      onDone();
      onClose();
    } catch (err) {
      toast.error(extractError(err, "Could not submit review"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rate your purchase">
      <form onSubmit={handleSubmit} className={classes.modalForm}>
        <StarRating value={rating} interactive size="lg" onChange={setRating} />
        <Textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
        <Button
          type="submit"
          className={classes.modalSubmitButton}
          loading={submitting}
        >
          Submit Review
        </Button>
      </form>
    </Modal>
  );
};

interface DisputeModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
}

const DisputeModal = ({ open, onClose, orderId }: DisputeModalProps) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/reports/disputes", {
        order: orderId,
        reason,
        description,
      });
      toast.success("Dispute raised — our team will review it shortly");
      onClose();
    } catch (err) {
      toast.error(extractError(err, "Could not raise dispute"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Raise a dispute">
      <form onSubmit={handleSubmit} className={classes.modalForm}>
        <Textarea
          label="Reason"
          required
          placeholder="e.g. Item not as described"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Textarea
          label="Details"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          type="submit"
          variant="danger"
          className={classes.modalSubmitButton}
          loading={submitting}
        >
          Submit Dispute
        </Button>
      </form>
    </Modal>
  );
};

export default OrderDetail;
