import { forwardRef, type TextareaHTMLAttributes } from 'react';

type TextareaFieldProps = {
  id: string;
  label?: string;
  error?: string;
  textareaClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ id, label, error, textareaClassName, className, ...textareaProps }, ref) => {
  return (
    <div className={className ?? 'grid gap-2'}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={
          textareaClassName ??
          'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500'
        }
        {...textareaProps}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

    </div>
  );
});

TextareaField.displayName = 'TextareaField';

export default TextareaField;
