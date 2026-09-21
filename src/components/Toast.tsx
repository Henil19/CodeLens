import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: `1px solid ${
              toast.type === 'success'
                ? 'var(--accent-emerald)'
                : toast.type === 'error'
                ? 'var(--accent-rose)'
                : 'var(--accent-cyan)'
            }`,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            fontSize: '0.84rem',
            color: 'var(--text-main)',
            animation: 'fadeIn 0.2s ease',
            minWidth: '260px',
            maxWidth: '380px'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
          {toast.type === 'error' && <AlertCircle size={16} color="var(--accent-rose)" />}
          {toast.type === 'info' && <Info size={16} color="var(--accent-cyan)" />}
          <span style={{ flex: 1 }}>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
