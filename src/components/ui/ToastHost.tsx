import React, { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { toastManager } from './toast-manager';
import './toast.css';

export const ToastHost: React.FC = () => {
  const { t } = useTranslation();
  const toasts = useSyncExternalStore(
    (onStoreChange) => toastManager.subscribe(onStoreChange),
    () => toastManager.getToasts(),
  );

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="status" aria-live="polite" data-testid="toast-host">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item" data-testid="toast-item">
          {t(toast.messageKey, toast.opts ?? {})}
        </div>
      ))}
    </div>
  );
};
