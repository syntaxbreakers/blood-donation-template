import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Clock, Calendar, AlertCircle, Building2, Phone } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import styles from './Feed.module.css';

interface BloodRequest {
  id: string;
  uid: string;
  fullName: string;
  bloodGroup: string;
  address: string;
  phone?: string;
  createdAt: number;
  expiresAt: number;
}

interface BloodCamp {
  id: string;
  uid: string;
  bankName: string;
  address: string;
  campDate: string;
  createdAt: number;
  stock?: string[];
}

export const Feed: React.FC = () => {
  const [view, setView] = useState<'requests' | 'camps'>('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = Date.now();
      
      // Fetch Requests
      const reqQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const reqSnapshot = await getDocs(reqQuery);
      const fetchedReqs: BloodRequest[] = [];
      reqSnapshot.forEach(doc => {
        const data = doc.data() as BloodRequest;
        if (data.expiresAt > now) {
          fetchedReqs.push({ ...data, id: doc.id });
        }
      });
      setRequests(fetchedReqs);

      // Fetch Camps
      const campQuery = query(collection(db, 'camps'), orderBy('campDate', 'asc'));
      const campSnapshot = await getDocs(campQuery);
      const fetchedCamps: BloodCamp[] = [];
      const today = new Date().toISOString().split('T')[0];
      campSnapshot.forEach(doc => {
        const data = doc.data() as BloodCamp;
        if (data.campDate >= today) {
          fetchedCamps.push({ ...data, id: doc.id });
        }
      });
      setCamps(fetchedCamps);

    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Less than an hour left';
    return `${hours} hours left`;
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Live Commuity Feed</h1>
          <p className={styles.subtitle}>Active emergency requests and upcoming donation camps</p>
        </div>

        <div className={styles.toggleContainer}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${view === 'requests' ? styles.active : ''}`}
              onClick={() => setView('requests')}
            >
              Urgent Requests
            </button>
            <button 
              className={`${styles.toggleBtn} ${view === 'camps' ? styles.active : ''}`}
              onClick={() => setView('camps')}
            >
              Donation Camps
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading community feed...</div>
        ) : view === 'requests' ? (
          <div className={styles.feedGrid}>
            {requests.length === 0 ? (
              <div className={styles.emptyState}>No active emergency blood requests currently.</div>
            ) : (
              requests.map(req => (
                <Card key={req.id} className={styles.postCard}>
                  <CardContent style={{ padding: '1.5rem' }}>
                    <div className={styles.cardHeader}>
                      <div className={styles.authorName}>
                        {req.fullName} Needs Blood
                        <span className={styles.badge} style={{ color: 'var(--blood-primary)', borderColor: 'var(--blood-primary)' }}>
                          {req.bloodGroup}
                        </span>
                      </div>
                      <div className={styles.metaItem} style={{ color: 'var(--blood-primary)', fontWeight: 600 }}>
                        <Clock size={16} />
                        {getTimeRemaining(req.expiresAt)}
                      </div>
                    </div>
                    <div className={styles.metaList}>
                      <div className={styles.metaItem}>
                        <MapPin size={18} className={styles.metaIcon} />
                        {req.address}
                      </div>
                      <div className={styles.metaItem}>
                        <AlertCircle size={18} className={styles.metaIcon} />
                        Posted {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {req.phone && (
                      <div style={{ marginTop: '1rem' }}>
                        <Button 
                          variant="success" 
                          fullWidth 
                          leftIcon={<Phone size={18} />}
                          onClick={() => {
                            if (req.phone) {
                              navigator.clipboard.writeText(req.phone);
                              alert('Phone number copied to clipboard: ' + req.phone);
                            }
                          }}
                        >
                          Call Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className={styles.feedGrid}>
            {camps.length === 0 ? (
              <div className={styles.emptyState}>No upcoming donation camps.</div>
            ) : (
              camps.map(camp => (
                <Card key={camp.id} className={styles.campCard}>
                  <CardContent style={{ padding: '1.5rem' }}>
                    <div className={styles.cardHeader}>
                      <div className={styles.authorName}>
                        <Building2 size={24} style={{ color: 'var(--text-muted)' }} />
                        {camp.bankName}
                      </div>
                      <span className={styles.badge}>Upcoming Camp</span>
                    </div>
                    <div className={styles.metaList}>
                      <div className={styles.metaItem} style={{ color: 'var(--action-green-hover)', fontWeight: 600 }}>
                        <Calendar size={18} />
                        {new Date(camp.campDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={18} className={styles.metaIcon} />
                        {camp.address}
                      </div>
                      {camp.stock && camp.stock.length > 0 && (
                        <div className={styles.metaItem} style={{ color: 'var(--blood-primary)' }}>
                          <strong>Accepting:</strong> {camp.stock.join(', ')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
