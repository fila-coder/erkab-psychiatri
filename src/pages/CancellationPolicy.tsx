import styles from './Marketing.module.css';

export function CancellationPolicy() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">Policies</p>
        <h1>Cancellation policy</h1>
        <p className={styles.lead}>
          <strong>Draft / not a legal document.</strong> This page is provisional guidance
          until final wording is published. It is not counsel-reviewed terms.
        </p>
        <section className={styles.section}>
          <h2>Patient cancellations</h2>
          <p>
            Please cancel as early as possible if you cannot attend a confirmed session.
            Exact notice periods and any fees will be confirmed in the final policy and in
            your booking confirmation.
          </p>
          <h2>Provider cancellations</h2>
          <p>
            If a psychiatrist cannot attend a confirmed session, the platform will work
            with you to reschedule or address payment according to the final policy.
          </p>
          <h2>Refunds</h2>
          <p>
            Online payment automation is still rolling out. Refunds, when applicable, may
            be handled manually by the operator until automated payouts and receipts are
            live.
          </p>
        </section>
      </div>
    </main>
  );
}
