import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Droplet, Menu, UserCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Droplet className={styles.logoIcon} size={24} />
          <span>BloodConnect</span>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            About Us
          </NavLink>
          <NavLink to="/feed" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Live Feed
          </NavLink>
          <NavLink to="/find-blood" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Find Blood
          </NavLink>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <Button variant="outline" leftIcon={<UserCircle size={18} />} onClick={() => navigate('/profile')}>
              My Profile
            </Button>
          ) : (
            <>
              <div className={styles.registerDropdown}>
                <span className={styles.navLink} style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>Register Now</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Log In
              </Button>
            </>
          )}
        </div>

        <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>Home</NavLink>
            <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>About Us</NavLink>
            <NavLink to="/feed" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>Live Feed</NavLink>
            <NavLink to="/find-blood" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>Find Blood</NavLink>
          </nav>

          <div className={styles.mobileActions}>
            {user ? (
              <Button variant="outline" fullWidth leftIcon={<UserCircle size={18} />} onClick={() => { navigate('/profile'); closeMenu(); }}>
                My Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" fullWidth style={{ marginBottom: '0.5rem' }} onClick={() => { navigate('/register'); closeMenu(); }}>
                  Register Now
                </Button>
                <Button variant="primary" fullWidth onClick={() => { navigate('/login'); closeMenu(); }}>
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
