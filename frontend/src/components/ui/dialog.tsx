import React from 'react';

export type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'} `}
      onClick={() => onOpenChange?.(false)}
    >
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/50 ${open ? '' : 'hidden'}`} />
      {/* Container */}
      <div className={`fixed inset-0 flex items-center justify-center p-4 ${open ? '' : 'hidden'}`}>
        {/* Stop close on content click */}
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    </div>
  );
}

export function DialogContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900 ${className}`}>{children}</div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</h3>;
}
export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{children}</p>;
}
export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}
