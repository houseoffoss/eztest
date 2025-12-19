'use client';

interface InlineErrorProps {
  message: string;
  onClose?: () => void;
}

export const InlineError = ({ message, onClose }: InlineErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
};
