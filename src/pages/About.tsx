import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, ShieldCheck, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import styles from './About.module.css';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        <section className={styles.headerSection}>
          <h1 className={styles.title}>About BloodConnect</h1>
          <p className={styles.subtitle}>
            Bridging the gap between blood donors and recipients. Every drop counts.
          </p>
        </section>

        <section className={styles.missionCard}>
          <h2 className={styles.missionTitle}>
            <Heart color="var(--blood-primary)" size={28} />
            Our Mission
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.1rem' }}>
            BloodConnect aims to provide a seamless, quick, and highly accessible platform to eradicate the 
            panic and struggle usually associated with hunting for blood during medical emergencies. 
            By leveraging modern technology and tapping into the goodwill of volunteer donors, we connect 
            those in urgent need directly with those who are willing to give the gift of life.
          </p>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIconWrapper}>
              <Activity size={24} />
            </div>
            <h3 className={styles.infoTitle}>Fast & Reliable Response</h3>
            <p className={styles.infoText}>
              Time is of the essence in medical emergencies. Our platform is designed to instantly search, 
              match, and notify available nearby donors or well-stocked blood banks to accelerate critical care.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIconWrapper}>
              <ShieldCheck size={24} />
            </div>
            <h3 className={styles.infoTitle}>Verified Network</h3>
            <p className={styles.infoText}>
              All blood banks and registered donors are systematically authenticated within our network. 
              We prioritize complete security, data privacy, and trust for all members in our registry.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIconWrapper}>
              <Users size={24} />
            </div>
            <h3 className={styles.infoTitle}>Community Driven</h3>
            <p className={styles.infoText}>
              We are nothing without the heroes among our public. By fostering a strong community of repeat 
              blood donors, we guarantee sustained local availability across all regions.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIconWrapper}>
              <Heart size={24} />
            </div>
            <h3 className={styles.infoTitle}>Saving Lives Together</h3>
            <p className={styles.infoText}>
              Donating blood is safe, easy, and practically painless. One single, selfless donation can 
              effectively separate and save up to three adult lives.
            </p>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to be part of the change?</h2>
          <p className={styles.ctaText}>Join our growing network of life-savers today.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Button variant="success" size="lg" onClick={() => navigate('/register')}>
              Become a Donor
            </Button>
            <Button variant="outline" size="lg" style={{ color: 'white', borderColor: 'white' }} onClick={() => navigate('/find-blood')}>
              Search Blood
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};
