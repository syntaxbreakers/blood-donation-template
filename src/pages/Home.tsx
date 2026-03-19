import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.title} animate-fade-in`}>Give Blood, Save Lives</h1>
          <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
            Your donation can bring a smile to someone's face. Register as a donor today or find blood when you need it most.
          </p>
          <div className={`${styles.heroActions} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            <Button size="lg" className={styles.primaryHeroBtn} onClick={() => navigate('/find-blood')}>
              Find Blood
            </Button>
            <Button size="lg" variant="outline" className={styles.outlineHeroBtn} onClick={() => navigate('/register')}>
              Register as Donor
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.red}`}>
              <Heart size={32} />
            </div>
            <h3 className={styles.featureTitle}>Become a Donor</h3>
            <p className={styles.featureDesc}>Join our community of heroes. Your single donation can save up to three lives.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Search size={32} />
            </div>
            <h3 className={styles.featureTitle}>Find Blood Quickly</h3>
            <p className={styles.featureDesc}>Search our extensive database of donors and blood banks near your location instantly.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.red}`}>
              <UserPlus size={32} />
            </div>
            <h3 className={styles.featureTitle}>Blood Banks</h3>
            <p className={styles.featureDesc}>Connect directly with certified blood banks to ensure safe and reliable transfusions.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
