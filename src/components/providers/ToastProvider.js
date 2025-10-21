'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = React.createContext(null);

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  error: <TriangleAlert className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
};

const VARIANT_STYLES = {
  success: 'border-emerald-100 bg-white/95',
  error: 'border-red-100 bg-white/95',
  info: 'border-blue-100 bg-white/95',
};

function ToastViewport({ toasts, dismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 md:justify-end md:pr-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${VARIANT_STYLES[toast.variant]}`}
          >
            <div className="mt-0.5">{ICONS[toast.variant]}</div>
            <div className="flex-1 text-sm text-gray-900">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              {toast.message && <div className="mt-0.5 text-gray-700">{toast.message}</div>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-200/80 hover:text-gray-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

ToastViewport.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      message: PropTypes.string,
      variant: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
    })
  ).isRequired,
  dismiss: PropTypes.func.isRequired,
};

function ConfirmDialog({ state, onDecision }) {
  if (!state) return null;
  const tone =
    state.tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur">
        {state.title && <h2 className="text-lg font-semibold text-gray-900">{state.title}</h2>}
        {state.message && <p className="mt-2 text-sm text-gray-700">{state.message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDecision(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            {state.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onDecision(true)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${tone}`}
          >
            {state.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  state: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    tone: PropTypes.oneOf(['primary', 'danger']),
  }),
  onDecision: PropTypes.func.isRequired,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const confirmRef = React.useRef(null);
  const [confirmState, setConfirmState] = React.useState(null);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = React.useCallback(({ title, message, variant }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, title, message, variant }]);
    setTimeout(() => dismiss(id), 4500);
    return id;
  }, [dismiss]);

  const api = React.useMemo(() => ({
    notify: (opts) => pushToast({ ...opts, variant: opts.variant || 'info' }),
    success: (message, opts = {}) =>
      pushToast({ title: opts.title, message, variant: 'success' }),
    error: (message, opts = {}) =>
      pushToast({ title: opts.title, message, variant: 'error' }),
    info: (message, opts = {}) =>
      pushToast({ title: opts.title, message, variant: 'info' }),
    confirm: ({ title, message, confirmLabel, cancelLabel, tone = 'primary' } = {}) =>
      new Promise((resolve) => {
        confirmRef.current = resolve;
        setConfirmState({ title, message, confirmLabel, cancelLabel, tone });
      }),
  }), [pushToast]);

  const handleDecision = React.useCallback((value) => {
    confirmRef.current?.(value);
    confirmRef.current = null;
    setConfirmState(null);
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
      <ConfirmDialog state={confirmState} onDecision={handleDecision} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
