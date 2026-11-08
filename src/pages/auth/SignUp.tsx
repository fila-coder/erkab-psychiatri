import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import styles from './Auth.module.css';

export function SignUp() {
  const { user, loading: authLoading, signUp, mode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole =
    params.get('role') === 'psychiatrist' ? 'PSYCHIATRIST' : 'PATIENT';

  const [role, setRole] = useState<'PATIENT' | 'PSYCHIATRIST'>(initialRole);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [email, password, displayName, role]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'PSYCHIATRIST' ? '/provider' : '/patient', {
        replace: true,
      });
    }
  }, [authLoading, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('You must accept the privacy notice and terms to continue.');
      return;
    }
    setLoading(true);
    const safetyTimer = window.setTimeout(() => {
      setLoading(false);
      setError('Account creation is taking too long. If you already registered, try signing in.');
    }, 12000);
    try {
      await signUp(email.trim(), password, displayName.trim(), role);
      window.clearTimeout(safetyTimer);
      navigate(role === 'PSYCHIATRIST' ? '/provider' : '/patient', {
        replace: true,
      });
    } catch (err) {
      window.clearTimeout(safetyTimer);
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setLoading(false);
    }
  }

  if (user) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.sub}>Taking you to your account…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className="eyebrow">Create account</p>
        <h1>Join Erkab</h1>
        <p className={styles.sub}>
          Book verified psychiatrists for secure video consultations.
        </p>

        {mode === 'local' && (
          <div className={styles.demoBox}>
            <strong>Local development mode</strong> (not used on the live site).
          </div>
        )}

        <div className={styles.roleToggle} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Button
            type="button"
            size="sm"
            variant={role === 'PATIENT' ? 'primary' : 'soft'}
            onClick={() => setRole('PATIENT')}
          >
            I am a patient
          </Button>
          <Button
            type="button"
            size="sm"
            variant={role === 'PSYCHIATRIST' ? 'primary' : 'soft'}
            onClick={() => setRole('PSYCHIATRIST')}
          >
            I am a psychiatrist
          </Button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            <span>Full name</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password (min. 8 characters)</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <Link to="/privacy" target="_blank">
                Privacy notice
              </Link>{' '}
              and{' '}
              <Link to="/terms" target="_blank">
                Terms of service
              </Link>
              . Erkab is not an emergency service.
            </span>
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} size="lg">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
