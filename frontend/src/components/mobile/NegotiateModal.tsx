import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import api from "../../api/api";
import type { ApiResponse } from "../../types/api";
import { formatCurrency } from "../../utils/format";
import { PATHS } from "../../routes/paths";
import type { Mobile } from "../../types/models";

export interface NegotiateModalProps {
  open: boolean;
  onClose: () => void;
  mobile: Mobile;
}

const classes = {
  description: "mb-4 text-sm text-gray-500",
  form: "space-y-4",
  submitButton: "w-full",
};

const NegotiateModal = ({ open, onClose, mobile }: NegotiateModalProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sellerId =
        typeof mobile.seller === "string" ? mobile.seller : mobile.seller._id;
      const { data } = await api.post<ApiResponse<{ _id: string }>>(
        "/chat/conversations",
        { recipientId: sellerId, mobileId: mobile._id },
      );
      const conversationId = data.data._id;
      await api.post(`/chat/conversations/${conversationId}/messages/offer`, {
        amount: Number(amount),
      });
      toast.success("Offer sent to the seller");
      onClose();
      navigate(PATHS.chatConversation(conversationId));
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not send offer",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Make an offer">
      <p className={classes.description}>
        Listed price is {formatCurrency(mobile.price)}. Send your best offer to
        the seller via chat.
      </p>
      <form onSubmit={handleSubmit} className={classes.form}>
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
        <Button
          type="submit"
          className={classes.submitButton}
          loading={loading}
        >
          Send Offer
        </Button>
      </form>
    </Modal>
  );
};

export default NegotiateModal;
