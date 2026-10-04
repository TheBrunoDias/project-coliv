import { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, className = '', ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={3}
        className={`resize-none rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...props}
      />
    </div>
  );
}
