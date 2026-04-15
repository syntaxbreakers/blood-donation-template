import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase';
import { MapPin, Phone, User, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { useLocations } from '../hooks/useLocations';
import styles from './FindBlood.module.css';

interface DonorBank {
  uid: string;
  fullName: string;
  bloodGroup: string;
  role: 'donor' | 'bank';
  state?: string;
  district?: string;
  phone?: string;
  address?: string;
}

export const FindBlood: React.FC = () => {
  const [searchType, setSearchType] = useState<'donor' | 'bank'>('donor');
  const [bloodGroup, setBloodGroup] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [results, setResults] = useState<DonorBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Hook for API locations
  const { states: apiStates, districts: apiDistricts, fetchDistricts, loadingStates, loadingDistricts } = useLocations();

  // Load districts when state changes
  useEffect(() => {
    fetchDistricts(state);
  }, [state, apiStates]);

  const statesOptions = [
    { value: '', label: loadingStates ? 'Loading states...' : 'Select State' },
    ...apiStates.map(s => ({ value: s.state_name, label: s.state_name }))
  ];

  const districtOptions = [
    { value: '', label: loadingDistricts ? 'Loading districts...' : 'Select District' },
    ...apiDistricts.map(d => ({ value: d.district_name, label: d.district_name }))
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Any Blood Group' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    
    try {
      let conditions = [where("role", "==", searchType)];
      if (bloodGroup) conditions.push(where("bloodGroup", "==", bloodGroup));
      if (state) conditions.push(where("state", "==", state));
      if (district) conditions.push(where("district", "==", district));

      const q = query(collection(db, "users"), ...conditions);
      const querySnapshot = await getDocs(q);
      
      const foundData: DonorBank[] = [];
      querySnapshot.forEach((doc) => {
        foundData.push(doc.data() as DonorBank);
      });
      
      setResults(foundData);
    } catch (err) {
      console.error("Error fetching results: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <section className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <h1 className={styles.searchTitle}>Find Blood</h1>
          <p className={styles.searchSubtitle}>Search our network of verified donors and blood banks</p>
        </div>

        <div className={styles.toggleContainer}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${searchType === 'donor' ? styles.active : ''}`}
              onClick={() => setSearchType('donor')}
            >
              Blood Donors
            </button>
            <button 
              className={`${styles.toggleBtn} ${searchType === 'bank' ? styles.active : ''}`}
              onClick={() => setSearchType('bank')}
            >
              Blood Banks
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className={styles.formCard}>
          <Select
            label="Blood Group"
            options={bloodGroupOptions}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <Select
            label="State"
            options={statesOptions}
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setDistrict('');
            }}
          />
          <Select
            label="District"
            options={districtOptions}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!state || loadingDistricts}
          />
          <Button type="submit" size="lg" disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </section>

      {hasSearched && (
        <section className={styles.resultsSection}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Search Results ({results.length})
          </h3>
          
          <div className={styles.resultsGrid}>
            {results.length === 0 && !loading ? (
              <Card>
                <CardContent style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No {searchType}s found for the selected criteria.
                </CardContent>
              </Card>
            ) : (
              results.map((result) => (
                <Card key={result.uid} className={styles.resultCard}>
                  <CardContent style={{ padding: '1.5rem' }}>
                    <div className={styles.resultHeader}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 className={styles.resultName}>{result.fullName}</h4>
                          <span className={styles.badge}>{result.bloodGroup}</span>
                        </div>
                        <div className={styles.resultMeta}>
                          {result.role === 'bank' ? <Building size={16} /> : <User size={16} />}
                          {result.role === 'bank' ? 'Blood Bank' : 'Individual Donor'}
                        </div>
                      </div>
                      
                      <Button variant="success" leftIcon={<Phone size={18} />} onClick={() => {
                        if (result.phone) {
                          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                          if (isMobile) {
                            window.location.href = `tel:${result.phone}`;
                          } else {
                            navigator.clipboard.writeText(result.phone);
                            alert('Phone number copied to clipboard: ' + result.phone);
                          }
                        } else {
                          alert('Phone number not available.');
                        }
                      }}>
                        Call Now
                      </Button>
                    </div>

                    <div className={styles.resultDetails}>
                      {result.phone && (
                        <div className={styles.detailRow}>
                          <Phone size={18} className={styles.detailIcon} />
                          <span>{result.phone}</span>
                        </div>
                      )}
                      
                      <div className={styles.detailRow}>
                        <MapPin size={18} className={styles.detailIcon} />
                        <span>{result.address ? result.address : (result.district || result.state ? `${result.district ? result.district + ', ' : ''}${result.state}` : 'Location Unspecified')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};
