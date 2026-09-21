import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={open} onClose={pending ? () => undefined : onCancel} title={title} maxWidth="sm">
      <div className="space-y-5">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

