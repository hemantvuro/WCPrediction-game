'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className={`bg-white border-l-4 ${colors[type]} rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] max-w-[420px] animate-slide-in`}>
      <span className="text-2xl">{icons[type]}</span>
      <p className="flex-1 text-gray-800 font-medium">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
  );
}
