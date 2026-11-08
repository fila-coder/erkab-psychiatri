import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import { Button } from './Button';

const nav = [
  { to: '/find', label: 'Find a psychiatrist' },
  { to: '/trust', label: 'Verification' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/for-psychiatrists', label: 'For psychiatrists' },
  { to: '/faq', label: 'FAQ' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const accountPath =
    user?.role === 'ADMIN' ||
    user?.role === 'FINANCE_ADMIN' ||
    user?.role === 'SUPPORT_AGENT'
      ? '/admin'
      : user?.role === 'PSYCHIATRIST'
        ? '/provider'
        : '/patient';

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label="Erkab Psychiatry home">
          <span className={styles.mark} aria-hidden="true">E</span>
          <span className={styles.brandText}>
            <strong>Erkab</strong>
            <span>Psychiatry</span>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to={accountPath} className={styles.signIn}>
                {user.displayName.split(' ')[0]}
              </Link>
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/sign-in" className={styles.signIn}>
                Sign in
              </Link>
              <Link to="/find">
                <Button size="sm">Book a visit</Button>
              </Link>
            </>
          )}
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={accountPath} className={styles.mobileLink} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => { setOpen(false); signOut(); }}
                style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth/sign-in" className={styles.mobileLink} onClick={() => setOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
