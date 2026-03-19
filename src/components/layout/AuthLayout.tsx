import React from 'react';
import { Card } from '../ui/Card';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Card className={styles.authCard}>
        {children}
      </Card>
    </div>
  );
};
