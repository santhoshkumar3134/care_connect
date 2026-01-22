import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dashed';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', icon: Icon, isLoading, className, ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-secondary text-white hover:bg-emerald-600 focus:ring-emerald-500",
    outline: "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500",
    ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
    danger: "bg-error text-white hover:bg-red-600 focus:ring-red-500",
    dashed: "border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-2 flex items-center justify-center",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, containerClassName, ...props }) => (
  <div className={`w-full ${containerClassName || ''}`}>
    {label && <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>}
    <input
      className={`w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-neutral-50 ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// --- Card ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}

export const Card: React.FC<CardProps> = ({ children, className, title, action, icon: Icon, ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden ${className || ''}`} {...props}>
    {(title || action || Icon) && (
      <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-neutral-500" />}
          {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'danger' | 'outline' | 'dashed';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const styles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'border border-neutral-200 text-neutral-600 bg-transparent',
    dashed: 'border border-dashed border-neutral-300 text-neutral-500 bg-transparent',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className || ''}`}>
      {children}
    </span>
  );
};

// --- Loading Skeleton ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`}></div>
);
