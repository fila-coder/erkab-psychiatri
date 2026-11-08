import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import styles from './SimplePage.module.css';

export function ForPsychiatrists() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">For psychiatrists</p>
        <h1>Join a platform that values credentials</h1>
        <p className={styles.lead}>
          Apply once, set your hours and fees within platform rules, and focus on
          consultations. Erkab handles booking, payment and payouts.
        </p>

        <h2>Application path</h2>
        <ol className={styles.list}>
          <li>Register and create a provider account</li>
          <li>Upload licence, identity and specialist qualification documents</li>
          <li>Erkab review team inspects every document</li>
          <li>Receive approval, more-information request, or rejection</li>
          <li>Only approved providers become publicly bookable</li>
        </ol>

        <div style={{ marginTop: 32 }}>
          <Link to="/auth/sign-up?role=psychiatrist">
            <Button size="lg">Apply to join Erkab</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
