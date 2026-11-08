import styles from './Marketing.module.css';

export function Contact() {
  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">Contact</p>
        <h1>Contact us</h1>
        <p className={styles.lead}>
          For non-emergency questions about the Erkab platform, use the details below.
        </p>
        <section className={styles.section}>
          <h2>Email</h2>
          <p>
            <a href="mailto:filimongselassie@gmail.com">filimongselassie@gmail.com</a>
          </p>
          <h2>Phone</h2>
          <p>
            <a href="tel:+251936573692">+251 936 573 692</a>
          </p>
        </section>
        <p className={styles.note}>
          Erkab is not an emergency service. If you are in crisis, use local emergency
          numbers or visit the Emergency information page.
        </p>
      </div>
    </main>
  );
}
