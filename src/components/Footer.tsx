import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.cols}>
          <div>
            <strong className={styles.brand}>Erkab Psychiatry</strong>
            <p className={styles.tagline}>
              Online psychiatric consultations with verified, licensed psychiatrists.
            </p>
          </div>
          <div>
            <strong>Patients</strong>
            <Link to="/find">Find a psychiatrist</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/emergency">Emergency information</Link>
          </div>
          <div>
            <strong>Psychiatrists</strong>
            <Link to="/auth/sign-up?role=psychiatrist">Apply to join</Link>
            <Link to="/trust">Verification</Link>
          </div>
          <div>
            <strong>Company</strong>
            <Link to="/about">About</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/cancellation-policy">Cancellation</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className={styles.legal}>
          <span>© 2026 Erkab Design. All rights reserved.</span>
          <span>Not for emergencies.</span>
        </div>
      </div>
    </footer>
  );
}
