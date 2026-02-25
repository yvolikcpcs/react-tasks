import type { InputHTMLAttributes } from 'react';

type FormFieldProps = {
  id: string;
  label?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function FormField({
  id,
  label,
  inputClassName,
  className,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={className ?? 'grid gap-2'}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={
          inputClassName ??
          'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500'
        }
        {...inputProps}
      />
    </div>
  );
}
