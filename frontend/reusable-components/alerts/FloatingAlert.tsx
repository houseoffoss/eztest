'use client';

import { X } from 'lucide-react';

export interface FloatingAlertMessage {
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface FloatingAlertProps {
  alert: FloatingAlertMessage | null;
  onClose: () => void;
}

export const FloatingAlert = ({ alert, onClose }: FloatingAlertProps) => {
  if (!alert) return null;

  const isSuccess = alert.type === 'success';
  const bgColor = isSuccess ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30';
  const titleColor = isSuccess ? 'text-green-400' : 'text-red-400';
  const messageColor = isSuccess ? 'text-green-300' : 'text-red-300';

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom ${bgColor} rounded-lg p-4 shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className={`font-semibold ${titleColor}`}>
            {alert.title}
          </h4>
          <p className={`text-sm mt-1 ${messageColor}`}>
            {alert.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

