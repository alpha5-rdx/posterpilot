import { useCallback, useRef, useState } from 'react';

/**
 * Lightweight toast notification manager.
 * @param {number} [autoDismissMs]
 */
export function useToasts(autoDismissMs = 3200) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++idRef.current;
      setToasts((current) => [...current, { id, message, type }]);
      if (autoDismissMs > 0) {
        setTimeout(() => dismiss(id), autoDismissMs);
      }
      return id;
    },
    [autoDismissMs, dismiss]
  );

  return {
    toasts,
    dismiss,
    notify: push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };
}
