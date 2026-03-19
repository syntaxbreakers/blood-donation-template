import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
