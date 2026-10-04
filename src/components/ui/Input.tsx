import { useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        className={`h-12 rounded-xl border border-border bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...props}
      />
    </div>
  );
}
