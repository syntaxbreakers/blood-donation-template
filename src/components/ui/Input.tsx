import React, { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', wrapperClassName = '', id, type = 'text', ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    const currentType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className={`${styles.container} ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper} style={{ position: 'relative' }}>
          <input
            id={inputId}
            ref={ref}
            type={currentType}
            className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
            style={type === 'password' ? { paddingRight: '2.5rem' } : undefined}
            {...props}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePassword}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
