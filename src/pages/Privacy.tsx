import styles from './SimplePage.module.css';

export function Privacy() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">Privacy</p>
        <p style={{color:"var(--muted)",marginBottom:12}}><strong>Draft notice:</strong> This privacy notice is a working draft, not final counsel-reviewed text.</p>
      <h1>Privacy notice</h1>
        <p className={styles.lead}>
          This is a draft notice for the Erkab Psychiatry platform. Final legal
          text must be reviewed by counsel before production use.
        </p>

        <h2>What we collect</h2>
        <p>
          Account details, intake answers needed for matching, appointment and
          payment metadata, and (for providers) professional credentials stored
          privately.
        </p>

        <h2>How we use it</h2>
        <p>
          To match you with eligible psychiatrists, manage bookings, process
          payments through a payment provider, and operate the service. We do not
          sell personal data.
        </p>

        <h2>Access</h2>
        <p>
          Psychiatrists see only their own patients’ appointment information.
          Staff actions are recorded in an audit log. Card details are handled
          by the payment provider, not stored on Erkab.
        </p>

        <h2>Your rights</h2>
        <p>
          You may review privacy settings and request changes from your account.
          Applicable local data-protection rights will be supported as the
          service expands.
        </p>
      </div>
    </main>
  );
}
