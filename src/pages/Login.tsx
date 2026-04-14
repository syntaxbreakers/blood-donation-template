import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CardContent } from '../components/ui/Card';
import { AuthLayout } from '../components/layout/AuthLayout';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset link sent to your email.');
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
      setResetMessage('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <CardContent style={{ padding: '2rem 1.5rem' }}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your BloodConnect account</p>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {resetMessage && <div style={{ color: 'var(--action-green-hover)', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#e0ffe0', borderRadius: '4px' }}>{resetMessage}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          <Input 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required 
          />
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <button type="button" onClick={handleResetPassword} style={{ background: 'none', border: 'none', color: 'var(--blood-primary)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
              Forgot Password?
            </button>
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Register Now</Link>
        </div>
      </CardContent>
    </AuthLayout>
  );
};
