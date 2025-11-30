import React from 'react';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Switch({ className = '', label, ...props }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors relative">
        <span className="absolute left-0 top-0 h-5 w-5 -translate-x-0.5 -translate-y-0.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></span>
      </span>
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}
