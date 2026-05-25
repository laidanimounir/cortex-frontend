import React from 'react';
import { useToast } from '../contexts/ToastContext';

const TOAST_COLORS = {
  success: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', icon: '✓' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', icon: '✕' },
  info: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', icon: 'ℹ' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', icon: '⚠' },
};

function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
        return (
          <div
            key={toast.id}
            className="toast-item"
            style={{
              background: colors.bg,
              borderColor: colors.border,
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-icon">{colors.icon}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
