import React from 'react';
import { Droplet } from 'lucide-react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Droplet color="#ef4444" fill="#ef4444" size={24} />
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>BloodConnect</span>
            </div>
            <p>Your drop of blood may create an ocean of happiness.</p>
          </div>
          
          <div className={styles.column}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/find-blood">Find Blood</Link></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          &copy; {new Date().getFullYear()} BloodConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
