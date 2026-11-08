import styles from './SimplePage.module.css';

export function HowItWorks() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h1>From first visit to follow-up</h1>
        <p className={styles.lead}>
          Erkab provides a single place for discovery, booking, secure video
          consultation, and continuity of care. Matching is a navigation aid, not
          a diagnosis or emergency triage.
        </p>

        <h2>Patient journey</h2>
        <ol className={styles.list}>
          <li><strong>Create an account</strong> — Sign up and complete your profile.</li>
          <li><strong>Confidential intake</strong> — Tell us what you need help with.</li>
          <li><strong>Choose a psychiatrist</strong> — Browse matches and verification details.</li>
          <li><strong>Book and pay</strong> — Pick a time and complete booking (online payment rolling out) online.</li>
          <li><strong>Join your session</strong> — Enter the session start (waiting room rolling out), then Zoom or Google Meet.</li>
          <li><strong>Feedback and follow-up</strong> — Rate the visit and book your next one.</li>
        </ol>

        <h2>Psychiatrist journey</h2>
        <ol className={styles.list}>
          <li><strong>Register</strong> — Create your provider account.</li>
          <li><strong>Submit credentials</strong> — Upload licence, identity and qualification documents.</li>
          <li><strong>Wait for approval</strong> — The Erkab team reviews your application.</li>
          <li><strong>Set up your profile</strong> — Add specialties, languages and availability.</li>
          <li><strong>Hold consultations</strong> — Join the session room and start the video visit.</li>
          <li><strong>Get paid</strong> — See earnings, configure payout details, view history.</li>
        </ol>
      </div>
    </main>
  );
}
