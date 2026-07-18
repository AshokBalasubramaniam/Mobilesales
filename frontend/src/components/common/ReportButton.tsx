import { useState, type FormEvent } from 'react';
import { Flag } from 'lucide-react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import api from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import type { ReportType } from '../../types/models';

export interface ReportButtonProps {
  reportType: ReportType;
  targetId: string;
  label?: string;
}

const classes = {
  trigger: 'flex items-center gap-1 text-xs text-gray-400 hover:text-red-500',
  triggerIcon: 'size-3.5',
  form: 'space-y-4',
  submitButton: 'w-full',
};

const ReportButton = ({ reportType, targetId, label = 'Report' }: ReportButtonProps) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reports', { reportType, targetId, reason, description });
      toast.success('Report submitted — our team will review it');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (err) {
      toast.error((isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => (isAuthenticated ? setOpen(true) : toast.error('Please login to report'))}
        className={classes.trigger}
      >
        <Flag className={classes.triggerIcon} /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report">
        <form onSubmit={handleSubmit} className={classes.form}>
          <Input label="Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
          <Textarea label="Details (optional)" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" variant="danger" className={classes.submitButton} loading={submitting}>
            Submit Report
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default ReportButton;
