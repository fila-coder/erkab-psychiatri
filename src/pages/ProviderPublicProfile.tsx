import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRepositories } from '../repositories';
import { getPlatformPackage } from '../services/pricing';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import type { PsychiatristProfile } from '../types';
import styles from './Marketing.module.css';

export function ProviderPublicProfile() {
  const { providerId } = useParams<{ providerId: string }>();
  const { user } = useAuth();
  const [p, setP] = useState<PsychiatristProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pkg = getPlatformPackage();

  useEffect(() => {
    if (!providerId) return;
    (async () => {
      setLoading(true);
      try {
        const profile = await getRepositories().psychiatrists.get(providerId);
        if (!profile || (profile.status !== 'ACTIVE' && profile.status !== 'APPROVED')) {
          setError('This psychiatrist is not available for public booking.');
          setP(null);
        } else {
          setP(profile);
          setError('');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [providerId]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="wrap">
          <p>Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error || !p) {
    return (
      <main className={styles.page}>
        <div className="wrap">
          <h1>Profile unavailable</h1>
          <p className={styles.lead}>{error || 'Not found.'}</p>
          <Link to="/find">
            <Button>Back to search</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="wrap">
        <p className="eyebrow">Psychiatrist</p>
        <h1>{p.professionalName}</h1>
        <p className={styles.lead}>{p.bio || 'No bio published yet.'}</p>
        <section className={styles.section}>
          <p>
            <strong>Languages:</strong> {p.languages.join(', ') || '—'}
          </p>
          <p>
            <strong>Specialties:</strong> {p.specialties.join(', ') || '—'}
          </p>
          <p>
            <strong>Jurisdictions:</strong> {p.jurisdictions.join(', ') || '—'}
          </p>
          <p>
            <strong>Session:</strong> {p.sessionDurationMin} min
          </p>
          <p>
            <strong>Package:</strong> {pkg.label}
          </p>
        </section>
        {user?.role === 'PATIENT' ? (
          <Link to={`/patient/book/${p.uid}`}>
            <Button size="lg">Book a session</Button>
          </Link>
        ) : (
          <Link to="/auth/sign-in">
            <Button size="lg">Sign in to book</Button>
          </Link>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/find">← Back to search</Link>
        </p>
      </div>
    </main>
  );
}
