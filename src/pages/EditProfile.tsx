import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useLocations } from '../hooks/useLocations';
import styles from './EditProfile.module.css';

export const EditProfile: React.FC = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bloodGroup: '',
    age: '',
    state: '',
    district: '',
    address: '',
    pincode: '',
    lastDonationDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phone: (userData as any).phone || '',
        bloodGroup: userData.bloodGroup || '',
        age: (userData as any).age || '',
        state: (userData as any).state || '',
        district: (userData as any).district || '',
        address: (userData as any).address || '',
        pincode: (userData as any).pincode || '',
        lastDonationDate: (userData as any).lastDonationDate || '',
      });
    } else if (user === null && userData === null) {
      // Small delay prevents immediate redirect during initial load
      const t = setTimeout(() => navigate('/login'), 500);
      return () => clearTimeout(t);
    }
  }, [userData, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { ...formData });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
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

  // Hook for API locations
  const { states: apiStates, districts: apiDistricts, fetchDistricts, loadingStates, loadingDistricts } = useLocations();

  // Load districts when state changes
  useEffect(() => {
    fetchDistricts(formData.state);
  }, [formData.state, apiStates]);

  const statesOptions = [
    { value: '', label: loadingStates ? 'Loading states...' : 'Select State' },
    ...apiStates.map(s => ({ value: s.state_name, label: s.state_name }))
  ];

  const districtOptions = [
    { value: '', label: loadingDistricts ? 'Loading districts...' : 'Select District' },
    ...apiDistricts.map(d => ({ value: d.district_name, label: d.district_name }))
  ];

  if (!userData) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.editLayout}>
        <CardContent style={{ padding: '2.5rem' }}>
          <h2 className={styles.title}>Edit Profile</h2>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            {success && <div className={styles.successAlert}>{success}</div>}

            <Input 
              label="Full Name" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input 
              label="Phone Number" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
            
            <Input 
              label="Age" 
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Years"
            />
            <Select 
              label="Blood Group" 
              name="bloodGroup"
              value={formData.bloodGroup}
              options={bloodGroupOptions}
              onChange={handleChange}
            />

            <Select
              label="State" 
              name="state"
              value={formData.state}
              options={statesOptions}
              onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({ ...prev, district: '' }));
              }}
            />
            <Select 
              label="District/City" 
              name="district"
              value={formData.district}
              options={districtOptions}
              onChange={handleChange}
              disabled={!formData.state || loadingDistricts}
            />

            <div style={{ gridColumn: '1 / -1' }}>
              <Input 
                label="Full Address" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Street Name"
              />
            </div>

            <Input 
              label="Pincode" 
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
            <Input 
              label="Last Donation Date" 
              name="lastDonationDate"
              type="date"
              value={formData.lastDonationDate}
              onChange={handleChange}
            />

            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
