import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import styles from './Auth.module.css';

export function SignIn() {
  const { user, loading: authLoading, signIn, mode, configError, resetPassword } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(from || '/account', { replace: true });
    }
  }, [authLoading, user, navigate, from]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const safetyTimer = window.setTimeout(() => {
      setLoading(false);
      setError('Sign-in is taking too long. Check your connection and try again.');
    }, 12000);
    try {
      await signIn(email.trim(), password);
      window.clearTimeout(safetyTimer);
      navigate(from || '/account', { replace: true });
    } catch (err) {
      window.clearTimeout(safetyTimer);
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your email above, then tap Forgot password.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(email.trim());
      setInfo('If an account exists for that email, a reset link has been sent. Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally {
      setResetLoading(false);
    }
  }

  if (user) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.sub}>Redirecting to your account…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className="eyebrow">Sign in</p>
        <h1>Welcome back</h1>
        <p className={styles.sub}>
          Access your appointments, messages, and account settings.
        </p>

        {configError && (
          <div className={styles.error} role="alert">
            {configError}
          </div>
        )}

        {mode === 'local' && (
          <div className={styles.demoBox}>
            <strong>Local development mode</strong>. Demo accounts are only available offline.
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <p style={{ margin: 0, fontSize: 14 }}>
            <button
              type="button"
              onClick={() => void onForgotPassword()}
              disabled={resetLoading}
              style={{
                background: 'none',
                border: 0,
                color: 'var(--accent, #2bb8c8)',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              {resetLoading ? 'Sending reset email…' : 'Forgot password?'}
            </button>
          </p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className={styles.sub} role="status">
              {info}
            </p>
          )}
          <Button type="submit" disabled={loading} size="lg">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className={styles.footer}>
          No account? <Link to="/auth/sign-up">Create one</Link>
        </p>
      </div>
    </main>
  );
}
