import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Star, Flag } from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { reviewsApi } from '../../api/reviews.api';
import { reportsApi } from '../../api/reports.api';
import { chatApi } from '../../api/chat.api';
import OrderTrackingTimeline from '../../components/order/OrderTrackingTimeline';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import StarRating from '../../components/common/StarRating';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS, DELIVERY_STATUS_STEPS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';

const OrderDetail = () => {
  const { id } = useParams();
  const { user, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('');

  const load = () => ordersApi.getById(id).then(({ data }) => setOrder(data.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) return <Spinner full />;

  const isBuyer = order.buyer._id === user._id;
  const isMySale = order.seller._id === user._id;
  const canCancel = isBuyer && ['pending', 'packed'].includes(order.deliveryStatus);
  const canReview = isBuyer && order.orderStatus === 'completed';
  const canUpdateTracking = (isMySale && isSeller) || isAdmin;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await ordersApi.cancel(id, 'Cancelled by user');
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingStatus) return;
    try {
      await ordersApi.updateTracking(id, { status: trackingStatus });
      toast.success('Tracking updated');
      setTrackingStatus('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update tracking');
    }
  };

  const handleChat = async () => {
    const recipientId = isBuyer ? order.seller._id : order.buyer._id;
    const { data } = await chatApi.startConversation({ recipientId, mobileId: order.mobile._id });
    navigate(PATHS.chatConversation(data.data._id));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={order.orderStatus === 'completed' ? 'green' : order.orderStatus === 'cancelled' ? 'red' : 'brand'}>
          {ORDER_STATUS_LABELS[order.orderStatus]}
        </Badge>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
        <OrderTrackingTimeline order={order} />
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <img src={order.mobile.images?.[0]?.url} alt="" className="size-16 rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />
        <div className="flex-1">
          <Link to={PATHS.mobileDetail(order.mobile._id)} className="font-semibold hover:text-brand-600">
            {order.mobile.brand} {order.mobile.model}
          </Link>
          <p className="text-sm text-gray-500">Sold by {order.seller.name}</p>
        </div>
        <span className="font-bold">{formatCurrency(order.pricing.totalAmount)}</span>
      </div>

      <div className="mb-6 space-y-1 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-500">Item price</span>
          <span>{formatCurrency(order.pricing.itemPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Delivery charge</span>
          <span>{formatCurrency(order.pricing.deliveryCharge)}</span>
        </div>
        {order.pricing.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({order.pricing.couponCode})</span>
            <span>-{formatCurrency(order.pricing.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-100 pt-2 font-bold dark:border-gray-800">
          <span>Total</span>
          <span>{formatCurrency(order.pricing.totalAmount)}</span>
        </div>
      </div>

      {canUpdateTracking && order.orderStatus !== 'cancelled' && order.orderStatus !== 'completed' && (
        <div className="mb-6 flex items-end gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <Select label="Update delivery status" value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)} className="flex-1">
            <option value="">Select status</option>
            {DELIVERY_STATUS_STEPS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Button onClick={handleUpdateTracking}>Update</Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon={MessageCircle} onClick={handleChat}>
          {isBuyer ? 'Chat Seller' : 'Chat Buyer'}
        </Button>
        {canReview && (
          <Button variant="secondary" icon={Star} onClick={() => setReviewOpen(true)}>
            Write a Review
          </Button>
        )}
        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </Button>
        )}
        {(isBuyer || isMySale) && order.orderStatus !== 'cancelled' && (
          <Button variant="ghost" icon={Flag} onClick={() => setDisputeOpen(true)}>
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

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} order={order} onDone={load} />
      <DisputeModal open={disputeOpen} onClose={() => setDisputeOpen(false)} orderId={order._id} />
    </div>
  );
};

const ReviewModal = ({ open, onClose, order, onDone }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewsApi.create({ orderId: order._id, rating, comment });
      toast.success('Review submitted');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rate your purchase">
      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating value={rating} interactive size="lg" onChange={setRating} />
        <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
        <Button type="submit" className="w-full" loading={submitting}>
          Submit Review
        </Button>
      </form>
    </Modal>
  );
};

const DisputeModal = ({ open, onClose, orderId }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportsApi.createDispute({ orderId, reason, description });
      toast.success('Dispute raised — our team will review it shortly');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not raise dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Raise a dispute">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea label="Reason" required placeholder="e.g. Item not as described" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Textarea label="Details" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" variant="danger" className="w-full" loading={submitting}>
          Submit Dispute
        </Button>
      </form>
    </Modal>
  );
};

export default OrderDetail;
