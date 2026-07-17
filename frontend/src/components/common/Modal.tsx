import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
  className?: string;
}

const classes = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
  panel: "w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl",
  header: "mb-4 flex items-center justify-between",
  title: "text-lg font-semibold",
  closeButton: "rounded-full p-1 hover:bg-gray-100",
  closeIcon: "size-5",
};

const Modal = ({ open, onClose, title, children, className }: ModalProps) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(classes.panel, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={classes.header}>
            <h2 className={classes.title}>{title}</h2>
            <button
              onClick={onClose}
              className={classes.closeButton}
              aria-label="Close"
            >
              <X className={classes.closeIcon} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
