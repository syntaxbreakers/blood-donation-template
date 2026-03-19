import React, { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', wrapperClassName = '', id, ...props }, ref) => {
    const defaultId = React.useId();
    const selectId = id || defaultId;

    return (
      <div className={`${styles.container} ${wrapperClassName}`}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            id={selectId}
            ref={ref}
            className={`${styles.select} ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.icon} size={16} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
