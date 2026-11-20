import React from "react";
import { GlassModal } from "./GlassModal";
import { GlassButton } from "./GlassButton";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      footer={
        <>
          <GlassButton variant="secondary" onClick={onCancel}>{cancelLabel}</GlassButton>
          <GlassButton variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</GlassButton>
        </>
      }
    >
      <span />
    </GlassModal>
  );
};
