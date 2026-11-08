import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { getRepositories } from '../repositories';
import { useAuth } from '../context/AuthContext';
import styles from './Find.module.css';
import type { PsychiatristProfile } from '../types';
import { getPlatformPackage } from '../services/pricing';

const COUNTRY_TO_CODE: Record<string, string> = {
  Ethiopia: 'ET',
  Kenya: 'KE',
  Uganda: 'UG',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  Any: '',
};

export function Find() {
  const { user } = useAuth();
  const [need, setNeed] = useState('Anxiety or low mood');
  const [lang, setLang] = useState('Any');
  const [country, setCountry] = useState('Any');
  const [shown, setShown] = useState(false);
  const [results, setResults] = useState<PsychiatristProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const jurisdiction = COUNTRY_TO_CODE[country] || '';

  useEffect(() => {
    if (!shown) return;
    (async () => {
      setLoading(true);
      try {
        const listPromise = getRepositories().psychiatrists.listActive({
          language: lang === 'Any' ? undefined : lang,
          specialty: need === 'Not sure yet' ? undefined : need.split(' ')[0],
          jurisdiction: jurisdiction || undefined,
        });
        const list = await Promise.race([
          listPromise,
          new Promise<typeof results>((resolve) =>
            setTimeout(() => resolve([]), 6000)
          ),
        ]);
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [shown, lang, need, jurisdiction]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShown(true);
  }

  const emptyMessage =
    'No psychiatrists are listed for public booking yet. Psychiatrists only appear here after admin approval (ACTIVE in the public directory). New applications stay private until approved. Clear language or region filters if you applied any.';

  return (
    <main className={styles.page}>
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Find a psychiatrist</p>
          <h1>Choose an eligible, verified psychiatrist</h1>
          <p>
            Only approved, verified providers appear. Eligibility depends on
            jurisdiction rules.
          </p>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            <span>What would you like help with?</span>
            <select value={need} onChange={(e) => setNeed(e.target.value)}>
              <option>Anxiety or low mood</option>
              <option>Sleep problems</option>
              <option>ADHD assessment</option>
              <option>Medication review</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <div className={styles.row}>
            <label>
              <span>Language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option>Any</option>
                <option>English</option>
                <option>Amharic</option>
                <option>Arabic</option>
                <option>French</option>
              </select>
            </label>
            <label>
              <span>Your country</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>Any</option>
                <option>Ethiopia</option>
                <option>Kenya</option>
                <option>Uganda</option>
                <option>United Arab Emirates</option>
                <option>United Kingdom</option>
                <option>United States</option>
              </select>
            </label>
          </div>
          <Button type="submit">Show matching psychiatrists</Button>
        </form>

        {shown && (
          <div className={styles.results} aria-live="polite">
            <p className={styles.resultNote}>
              {loading
                ? 'Loading…'
                : results.length === 0
                  ? emptyMessage
                  : `Showing ${results.length} verified psychiatrist(s).`}
            </p>
            {results.map((p) => (
              <article key={p.uid} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.av}>
                    {p.professionalName
                      .replace(/\(Demo\)/g, '')
                      .split(' ')
                      .filter((w) => w.length > 1)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </div>
                  <div>
                    <h2>
                      <Link
                        to={`/psychiatrist/${p.uid}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {p.professionalName}
                      </Link>
                    </h2>
                    <p>
                      {p.specialties.join(' · ')} · {p.languages.join(', ')}
                    </p>
                  </div>
                </div>
                <ul className={styles.checks}>
                  <li>
                    <span>Medical licence</span>
                    <em>
                      {p.trustPassport.licence.status === 'checked'
                        ? 'Checked'
                        : 'Pending'}
                    </em>
                  </li>
                  <li>
                    <span>Identity</span>
                    <em>
                      {p.trustPassport.identity.status === 'checked'
                        ? 'Checked'
                        : 'Pending'}
                    </em>
                  </li>
                  <li>
                    <span>Qualification</span>
                    <em>
                      {p.trustPassport.qualification.status === 'checked'
                        ? 'Checked'
                        : 'Pending'}
                    </em>
                  </li>
                </ul>
                <div className={styles.cardActions}>
                  <span className={styles.price}>
                    {getPlatformPackage().label}
                    {' · '}
                    {p.sessionDurationMin} min
                    {p.jurisdictions.length
                      ? ` · ${p.jurisdictions.join(', ')}`
                      : ''}
                  </span>
                  <Link to={`/psychiatrist/${p.uid}`}>
                    <Button size="sm" variant="soft">
                      View profile
                    </Button>
                  </Link>
                  {user?.role === 'PATIENT' ? (
                    <Link to={`/patient/book/${p.uid}`}>
                      <Button size="sm">Book</Button>
                    </Link>
                  ) : (
                    <Link to="/auth/sign-in">
                      <Button size="sm">Sign in to book</Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
