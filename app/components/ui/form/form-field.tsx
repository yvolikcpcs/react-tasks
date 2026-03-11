import { forwardRef, type InputHTMLAttributes } from 'react';

type FormFieldProps = {
  id: string;
  label?: string;
  error?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (props, ref) => {
    const {
      id,
      label,
      error,
      inputClassName,
      className,
      ...inputProps
    } = props;
    return (
      <div className={className ?? 'grid gap-2'}>
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={
            inputClassName ??
            'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500'
          }
          {...inputProps}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

