import styles from './Marketing.module.css';

export function About() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">About</p>
        <h1>About Erkab Psychiatry</h1>
        <p className={styles.lead}>
          Erkab Psychiatry is an online platform for psychiatric consultations with
          verified, licensed psychiatrists.
        </p>
        <section className={styles.section}>
          <h2>What we do</h2>
          <p>
            Patients can find eligible psychiatrists, complete intake, and request
            bookings. Psychiatrists apply, complete verification, and — once approved by
            the platform — appear in public search for booking.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Verification</h2>
          <p>
            Psychiatrists complete an application and review process before they appear in
            public search. Details are on the Verification page. Erkab is not an emergency
            service.
          </p>
        </section>
        <section className={styles.section}>
          <h2>Features in progress</h2>
          <p>
            Integrated video visits, secure online payment, virtual waiting room, automated
            earnings/payout history, and self-serve receipts/refunds are rolling out and may
            be labelled “Coming soon” where not fully live yet.
          </p>
        </section>
      </div>
    </main>
  );
}
