// Simple toast notification system

type ToastType = 'success' | 'error' | 'warning' | 'info';

let toastId = 0;
const listeners: Array<(toast: ToastMessage) => void> = [];

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = 'info') {
  const toast: ToastMessage = {
    id: toastId++,
    message,
    type,
  };

  listeners.forEach(listener => listener(toast));
}

export function subscribeToToasts(listener: (toast: ToastMessage) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

// Convenience functions
export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  warning: (message: string) => showToast(message, 'warning'),
  info: (message: string) => showToast(message, 'info'),
};
