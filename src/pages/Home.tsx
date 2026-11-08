import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import styles from './Home.module.css';

const facts = [
  'Video visits via Zoom or Google Meet',
  'Secure online payment',
  'Confidential intake',
  'Jurisdiction-aware eligibility',
];

const verificationSteps = [
  { step: '01', title: 'Application', body: 'The psychiatrist registers and submits professional details.' },
  { step: '02', title: 'Documents', body: 'Licence, identity and specialist qualification are uploaded for review.' },
  { step: '03', title: 'Review', body: 'An Erkab administrator inspects each document and may request more.' },
  { step: '04', title: 'Decision', body: 'The application is approved, rejected, or returned with questions.' },
  { step: '05', title: 'Go live', body: 'Only approved psychiatrists set availability and receive bookings.' },
];

const patientBenefits = [
  'Smart matching from a confidential intake',
  'Verification details visible on every profile',
  'Waiting room, then a secure video link',
  'Receipts, cancellations and refund requests in your account',
];

const providerBenefits = [
  'Professional profile with specialties and languages',
  'Availability and appointment management',
  'Earnings and payout history in one view',
  'Clear responses to verification requests',
];

export function Home() {
  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">Online psychiatry, internationally</p>
            <h1>See a psychiatrist whose credentials we have checked ourselves.</h1>
            <p className={styles.lead}>
              Erkab connects patients with licensed psychiatrists for video consultations.
              Every psychiatrist is reviewed by our team before their profile goes live,
              and you can see what was verified before you book.
            </p>
            <div className={styles.cta}>
              <Link to="/find">
                <Button size="lg">Find a psychiatrist</Button>
              </Link>
              <Link to="/for-psychiatrists">
                <Button variant="ghost" size="lg">I am a psychiatrist</Button>
              </Link>
            </div>
            <ul className={styles.facts}>
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <figure className={styles.heroPhoto}>
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80"
                alt="Calm professional consultation setting — illustrative stock photography, not a real Erkab clinician"
                width={600}
                height={400}
                loading="eager"
              />
              <figcaption className={styles.photoCredit}>
                Illustrative stock photo (Unsplash). Not a real Erkab psychiatrist.
              </figcaption>
            </figure>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <span className={styles.dot} />
                <span className="eyebrow">Trust Passport</span>
              </div>
              <div className={styles.passport}>
                <div className={styles.avatar}>DR</div>
                <div>
                  <h3>Verified profile</h3>
                  <p>Medical licence · Identity · Specialist qualification</p>
                </div>
              </div>
              <ul className={styles.checks}>
                <li><span>Medical licence</span><em>Checked</em></li>
                <li><span>Identity document</span><em>Checked</em></li>
                <li><span>Specialist qualification</span><em>Checked</em></li>
                <li><span>Erkab interview</span><em>Completed</em></li>
              </ul>
              <p className={styles.note}>
                Every public profile shows only attributes Erkab has substantiated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className={styles.section} id="verification">
        <div className="wrap">
          <div className={styles.secHead}>
            <p className="eyebrow">Verification</p>
            <h2>A psychiatrist is not listed until Erkab approves them.</h2>
            <p>
              Applications go to our review team. Providers cannot accept bookings while
              any step is open, and we can suspend a profile at any time.
            </p>
          </div>
          <ol className={styles.steps}>
            {verificationSteps.map((s) => (
              <li key={s.step} className={styles.step}>
                <span className={styles.stepNum}>{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it works preview */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.secHead}>
            <p className="eyebrow">How it works</p>
            <h2>From first visit to follow-up, in one place.</h2>
          </div>
          <div className={styles.journey}>
            <div className={styles.journeyCard}>
              <h3>As a patient</h3>
              <ol>
                <li>Create an account and complete a confidential intake</li>
                <li>Browse matches with verification details</li>
                <li>Book a time and pay securely</li>
                <li>Join the waiting room, then your video session</li>
                <li>Access receipts and book follow-ups</li>
              </ol>
              <Link to="/how-it-works">
                <Button variant="soft" size="sm">See full patient journey</Button>
              </Link>
            </div>
            <div className={styles.journeyCard}>
              <h3>As a psychiatrist</h3>
              <ol>
                <li>Register and submit credentials</li>
                <li>Wait for Erkab review and approval</li>
                <li>Set specialties, languages and availability</li>
                <li>Hold consultations via secure video</li>
                <li>Track earnings and configure payouts</li>
              </ol>
              <Link to="/how-it-works">
                <Button variant="soft" size="sm">See full provider journey</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.secHead}>
            <p className="eyebrow">Who it is for</p>
            <h2>Built for patients and for the psychiatrists who treat them.</h2>
          </div>
          <div className={styles.split}>
            <article className={styles.card}>
              <h3>For patients</h3>
              <p>
                Choose a psychiatrist by specialty and language, book a time that suits
                your timezone, and pay securely before the session.
              </p>
              <ul className={styles.ticks}>
                {patientBenefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link to="/auth/sign-up">
                <Button>Create a patient account</Button>
              </Link>
            </article>
            <article className={styles.card}>
              <h3>For psychiatrists</h3>
              <p>
                Apply once, set your availability (hours management — rolling out) within platform rules, and focus
                on consultations. Erkab handles booking, payment and payouts.
              </p>
              <ul className={styles.ticks}>
                {providerBenefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link to="/auth/sign-up?role=psychiatrist">
                <Button variant="ghost">Apply to join Erkab</Button>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Privacy & safety */}
      <section className={styles.section}>
        <div className={`wrap ${styles.safety}`}>
          <div>
            <p className="eyebrow">Privacy &amp; safety</p>
            <h2>Your health information stays between you and your psychiatrist.</h2>
            <p className={styles.lead}>
              Erkab is built so that people only see what they need to see.
            </p>
            <div className={styles.crisis}>
              <strong>Erkab is not an emergency service.</strong>{' '}
              If you or someone near you is in immediate danger, contact your local
              emergency number or the nearest hospital.
            </div>
          </div>
          <dl className={styles.dl}>
            <div>
              <dt>Confidential intake</dt>
              <dd>Your answers are used to match you with a suitable psychiatrist and are not shown to other patients.</dd>
            </div>
            <div>
              <dt>Limited access</dt>
              <dd>Psychiatrists see appointment information for their own patients only. Staff actions are recorded in an audit log.</dd>
            </div>
            <div>
              <dt>Secure payments</dt>
              <dd>Card details are handled by the payment provider, not stored on Erkab.</dd>
            </div>
            <div>
              <dt>Control of your account</dt>
              <dd>You can review your privacy settings and request changes from your account.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="wrap">
          <div className={styles.ctaBox}>
            <h2>Ready to book your first consultation?</h2>
            <p>
              Create an account, complete the confidential intake, and choose from
              verified psychiatrists.
            </p>
            <div className={styles.cta}>
              <Link to="/auth/sign-up">
                <Button size="lg">Get started</Button>
              </Link>
              <Link to="/for-psychiatrists">
                <Button variant="ghost" size="lg">Join as a psychiatrist</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
