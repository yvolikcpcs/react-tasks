import type { TextareaHTMLAttributes } from 'react';

type TextareaFieldProps = {
  id: string;
  label?: string;
  textareaClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextareaField({
  id,
  label,
  textareaClassName,
  className,
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <div className={className ?? 'grid gap-2'}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={
          textareaClassName ??
          'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500'
        }
        {...textareaProps}
      />
    </div>
  );
}
