import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRepositories } from '../../repositories';
import { Button } from '../../components/Button';
import styles from '../Dashboard.module.css';

const REASONS = [
  'Anxiety or low mood',
  'Sleep problems',
  'ADHD assessment',
  'Medication review',
  'Not sure yet',
];

function cacheKey(uid: string) {
  return `erkab_intake_${uid}`;
}

export function Intake() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jurisdiction, setJurisdiction] = useState('ET');
  const [reasons, setReasons] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(cacheKey(user.uid));
      if (raw) {
        const c = JSON.parse(raw) as {
          jurisdiction?: string;
          reasons?: string[];
          languages?: string[];
        };
        if (c.jurisdiction) setJurisdiction(c.jurisdiction);
        if (c.reasons) setReasons(c.reasons);
        if (c.languages) setLanguages(c.languages);
      }
    } catch {
      /* ignore */
    }
    void getRepositories()
      .patients.get(user.uid)
      .then((p) => {
        if (p) {
          setJurisdiction(p.jurisdiction || 'ET');
          setReasons(p.intake?.reasons || []);
          setLanguages(p.intake?.languages || ['English']);
        }
      })
      .catch(() => null);
  }, [user]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    const payload = {
      uid: user.uid,
      jurisdiction,
      intake: {
        reasons,
        languages,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        cacheKey(user.uid),
        JSON.stringify({ jurisdiction, reasons, languages })
      );
    } catch {
      /* ignore */
    }

    try {
      await Promise.race([
        getRepositories().patients.upsert(payload),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'Saving is taking too long. Your answers were saved on this device.'
                )
              ),
            8000
          )
        ),
      ]);
      setSaved(true);
      setTimeout(() => navigate('/patient'), 600);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the server. Answers kept on this device.'
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className={styles.pageHead}>
        <div>
          <p className="eyebrow">Confidential intake</p>
          <h1>Help us match you</h1>
        </div>
      </header>
      <p className={styles.lead}>
        Answers are used only for matching and eligibility. Erkab is not an emergency
        service.
      </p>
      <form onSubmit={onSubmit} className={styles.formCard}>
        <label>
          <span>Your current country / jurisdiction</span>
          <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
            <option value="ET">Ethiopia</option>
            <option value="KE">Kenya</option>
            <option value="UG">Uganda</option>
            <option value="AE">United Arab Emirates</option>
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </label>
        <fieldset>
          <legend>What would you like help with?</legend>
          {REASONS.map((r) => (
            <label key={r} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={reasons.includes(r)}
                onChange={() => toggle(reasons, r, setReasons)}
              />
              <span>{r}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Preferred languages</legend>
          {['English', 'Amharic', 'Arabic', 'French'].map((l) => (
            <label key={l} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={languages.includes(l)}
                onChange={() => toggle(languages, l, setLanguages)}
              />
              <span>{l}</span>
            </label>
          ))}
        </fieldset>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save intake'}
        </Button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {saved && !error && <p className={styles.success}>Saved.</p>}
        {saved && error && (
          <p className={styles.success}>Saved on this device. Server sync pending.</p>
        )}
      </form>
    </div>
  );
}
