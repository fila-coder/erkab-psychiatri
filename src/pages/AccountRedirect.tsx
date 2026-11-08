import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

const LOAD_TIMEOUT_MS = 5000;

export function AccountRedirect() {
  const { user, loading, configError, signOut, refreshProfile } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const t = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
        <p>Loading your account…</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>This usually takes a few seconds.</p>
      </div>
    );
  }

  if (loading && timedOut) {
    return (
      <div style={{ padding: 48, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>Taking longer than expected</h1>
        <p style={{ color: 'var(--muted)', margin: '12px 0 20px' }}>
          We could not finish loading your profile. This is often a network or Firestore
          permission issue.
        </p>
        {configError && (
          <p role="alert" style={{ color: '#c44', marginBottom: 16 }}>
            {configError}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              setTimedOut(false);
              void refreshProfile();
            }}
          >
            Retry
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link to="/">
            <Button variant="soft">Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (
    user.role === 'ADMIN' ||
    user.role === 'FINANCE_ADMIN' ||
    user.role === 'SUPPORT_AGENT'
  ) {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'PSYCHIATRIST') {
    return <Navigate to="/provider" replace />;
  }
  return <Navigate to="/patient" replace />;
}
