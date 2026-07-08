import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { chatApi } from '../../api/chat.api';
import { formatCurrency } from '../../utils/format';
import { PATHS } from '../../routes/paths';

const NegotiateModal = ({ open, onClose, mobile }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await chatApi.startConversation({ recipientId: mobile.seller._id, mobileId: mobile._id });
      const conversationId = data.data._id;
      await chatApi.sendOffer(conversationId, Number(amount));
      toast.success('Offer sent to the seller');
      onClose();
      navigate(PATHS.chatConversation(conversationId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Make an offer">
      <p className="mb-4 text-sm text-gray-500">
        Listed price is {formatCurrency(mobile.price)}. Send your best offer to the seller via chat.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your offer (₹)"
          type="number"
          required
          min={1}
          max={mobile.price}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send Offer
        </Button>
      </form>
    </Modal>
  );
};

export default NegotiateModal;
