import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { CardContent } from '../components/ui/Card';
import { AuthLayout } from '../components/layout/AuthLayout';
import styles from './Register.module.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    role: 'donor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Save extra user details to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName: formData.fullName,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  return (
    <AuthLayout>
      <CardContent style={{ padding: '2rem 1.5rem' }}>
        <h2 className={styles.title}>Create an Account</h2>
        <p className={styles.subtitle}>Join BloodConnect to save lives</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form className={styles.form} onSubmit={handleRegister}>
          <Input 
            label="Full Name / Bank Name" 
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required 
          />
          <Input 
            label="Email Address" 
            name="email"
            type="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required 
          />
          <div className={styles.row}>
            <Input 
              label="Password" 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required 
            />
            <Input 
              label="Confirm Password" 
              name="confirmPassword"
              type="password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required 
            />
          </div>
          <div className={styles.row}>
            {formData.role === 'donor' && (
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={bloodGroupOptions}
                required
              />
            )}
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'donor', label: 'Blood Donor' },
                { value: 'bank', label: 'Blood Bank' }
              ]}
              required
            />
          </div>
          
          <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Sign Up'}
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Log In</Link>
        </div>
      </CardContent>
    </AuthLayout>
  );
};
