import { forwardRef } from 'react';
import clsx from 'clsx';

const VARIANTS = {
  primary:
    'bg-accent text-base font-semibold hover:shadow-glow-strong hover:brightness-110 active:brightness-95',
  secondary:
    'bg-card border border-border text-text hover:border-accent/40 hover:bg-card-hover',
  ghost: 'text-text-muted hover:text-text hover:bg-white/5',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3.5 gap-2.5',
};

const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className, icon: Icon, iconPosition = 'left', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
