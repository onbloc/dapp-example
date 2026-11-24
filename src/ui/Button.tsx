import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = ({ variant = 'secondary', size = 'md', loading, icon, children, className = '', disabled, ...rest }: ButtonProps) => (
  <button
    type="button"
    className={`btn btn-${variant} btn-${size} ${className}`}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {loading ? <span className="spinner" aria-hidden /> : icon}
    {children && <span>{children}</span>}
  </button>
);
