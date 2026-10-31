import { CheckIcon, AlertIcon, InfoIcon } from './Icons.jsx';

const ICONS = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
};

/**
 * Renders the stack of active toast notifications.
 * @param {{ toasts: Array<{id:number,type:string,message:string}>, onDismiss:(id:number)=>void }} props
 */
export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || InfoIcon;
        return (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            <span className="toast__icon">
              <Icon />
            </span>
            <span className="toast__msg">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
