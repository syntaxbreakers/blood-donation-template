import React, { type HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', clickable, ...props }) => {
  return (
    <div className={`${styles.card} ${clickable ? styles.clickable : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`${styles.header} ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`${styles.title} ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`${styles.content} ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`${styles.footer} ${className}`} {...props}>
    {children}
  </div>
);
