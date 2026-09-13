import React from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';

export interface LogoutModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  isLoading = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => undefined : onCancel} title="Log out?" maxWidth="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
            <LogOut className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Are you sure you want to log out?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You will need to sign in again to manage the Cinema Management admin portal.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-rose-500 hover:bg-rose-600 text-white inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};