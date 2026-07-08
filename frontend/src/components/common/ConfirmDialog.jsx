import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', variant = 'danger', loading }) => (
  <Modal open={open} onClose={onClose} title={title}>
    {description && <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    <div className="flex justify-end gap-2">
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
