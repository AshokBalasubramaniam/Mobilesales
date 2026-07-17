import Modal from './Modal';
import Button, { type ButtonProps } from './Button';

const classes = {
  description: 'mb-5 text-sm text-gray-600 dark:text-gray-400',
  actions: 'flex justify-end gap-2',
};

export interface ConfirmDialogProps {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: ButtonProps['variant'];
  loading?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} title={title}>
    {description && <p className={classes.description}>{description}</p>}
    <div className={classes.actions}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
