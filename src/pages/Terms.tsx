import styles from './SimplePage.module.css';

export function Terms() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">Legal</p>
        <p style={{color:"var(--muted)",marginBottom:12}}><strong>Draft / not a legal document.</strong> Final terms must be counsel-reviewed.</p>
      <h1>Terms of service</h1>
        <p className={styles.lead}>
          Draft terms for the Erkab Psychiatry platform. Final text must be
          reviewed by counsel before production use.
        </p>
        <h2>Service description</h2>
        <p>
          Erkab connects patients with independently licensed psychiatrists for
          scheduled video consultations. Erkab is not a medical provider and does
          not provide emergency care, diagnosis by the platform, or guaranteed
          clinical outcomes.
        </p>
        <h2>Accounts</h2>
        <p>
          You must provide accurate information and keep credentials secure.
          Psychiatrists must only accept bookings in jurisdictions where they are
          legally authorized to practise.
        </p>
        <h2>Payments and cancellations</h2>
        <p>
          Fees are shown before booking. Payment processing depends on a configured
          payment provider. Cancellation and refund rules are stated on the
          cancellation policy page and on each booking.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, Erkab is not liable for clinical decisions
          made by independent practitioners or for inability to obtain emergency
          care through the platform.
        </p>
      </div>
    </main>
  );
}
