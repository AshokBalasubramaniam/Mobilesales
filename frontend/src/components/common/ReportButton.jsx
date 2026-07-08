import { useState } from 'react';
import { Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import { reportsApi } from '../../api/reports.api';
import { useAuth } from '../../hooks/useAuth';

const ReportButton = ({ reportType, targetId, label = 'Report' }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportsApi.create({ reportType, targetId, reason, description });
      toast.success('Report submitted — our team will review it');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => (isAuthenticated ? setOpen(true) : toast.error('Please login to report'))}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
      >
        <Flag className="size-3.5" /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
          <Textarea label="Details (optional)" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" variant="danger" className="w-full" loading={submitting}>
            Submit Report
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default ReportButton;
