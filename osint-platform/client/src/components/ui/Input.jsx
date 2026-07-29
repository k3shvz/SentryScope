import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(
  ({ label, error, hint, icon: Icon, type = 'text', className, id, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full group">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-text-muted mb-1.5 group-focus-within:text-accent transition-colors duration-200">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none group-focus-within:text-accent transition-colors duration-200"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && show ? 'text' : type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={clsx(
              'w-full bg-white/[0.03] border rounded-lg text-sm text-text placeholder:text-text-faint/50',
              'py-2.5 outline-none transition-all duration-200',
              'focus:bg-white/[0.05] focus:shadow-glow',
              Icon ? 'pl-10' : 'pl-3.5',
              isPassword ? 'pr-10' : 'pr-3.5',
              error ? 'border-danger/50 focus:border-danger focus:shadow-danger-glow' : 'border-border/80 focus:border-accent/80',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-danger text-xs mt-1.5">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-text-faint text-xs mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
