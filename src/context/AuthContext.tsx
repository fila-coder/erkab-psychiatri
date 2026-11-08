import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { UserRole, AppUser } from '../types';
import {
  getRepositories,
  resetRepositoryCache,
  getDataMode,
} from '../repositories';
import { getSessionUid, setSessionUid } from '../repositories/localStore';
import { isFirebaseConfigured, auth as firebaseAuth } from '../lib/firebase';
import { friendlyAuthError } from '../lib/authErrors';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  timezone: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  mode: 'local' | 'firebase';
  configError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: 'PATIENT' | 'PSYCHIATRIST'
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: AppUser): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    timezone: u.timezone,
  };
}

function roleFromProfile(profile: AppUser | null | undefined): UserRole {
  if (!profile?.role) return 'PATIENT';
  if (profile.role === 'ADMIN') return 'ADMIN';
  if (profile.role === 'FINANCE_ADMIN') return 'FINANCE_ADMIN';
  if (profile.role === 'SUPPORT_AGENT') return 'SUPPORT_AGENT';
  if (profile.role === 'PSYCHIATRIST') return 'PSYCHIATRIST';
  return 'PATIENT';
}

function authUserFromProfile(
  fb: { uid: string; email: string | null; displayName: string | null },
  profile: AppUser
): AuthUser {
  return {
    uid: fb.uid,
    email: fb.email || profile.email || '',
    displayName: fb.displayName || profile.displayName || fb.email || 'User',
    role: roleFromProfile(profile),
    timezone:
      profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out. Check your connection.`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Read users/{uid} — null if missing or timed out. */
async function readUserDoc(uid: string): Promise<AppUser | null> {
  try {
    return await withTimeout(
      getRepositories().users.getById(uid),
      5000,
      'Loading profile'
    );
  } catch {
    return null;
  }
}

/**
 * Write users/{uid} with role. MUST succeed for sign-up.
 * Document ID = Auth uid. Fields match what sign-in reads.
 */
async function writeUserDoc(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole
): Promise<AppUser> {
  const t = new Date().toISOString();
  const u: AppUser = {
    uid,
    email: (email || '').toLowerCase(),
    displayName: displayName || email || 'User',
    role,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: 'active',
    createdAt: t,
    updatedAt: t,
  };

  await withTimeout(getRepositories().users.create(u), 8000, 'Saving profile');

  // Best-effort related docs (do not fail sign-up if these hang)
  if (role === 'PATIENT') {
    void getRepositories()
      .patients.upsert({ uid, jurisdiction: '', updatedAt: t })
      .catch(() => null);
  }
  if (role === 'PSYCHIATRIST') {
    void getRepositories()
      .psychiatrists.upsert({
        uid,
        status: 'DRAFT',
        professionalName: displayName || 'Psychiatrist',
        bio: '',
        specialties: [],
        languages: [],
        jurisdictions: [],
        sessionDurationMin: 50,
        price: { amount: 0, currency: 'USD' },
        trustPassport: {
          identity: { status: 'pending' },
          licence: { status: 'pending' },
          qualification: { status: 'pending' },
          interview: { status: 'pending' },
          overall: 'unverified',
        },
        cancellationPolicy: '',
        updatedAt: t,
      })
      .catch(() => null);
  }

  // Confirm read-back (optional)
  const written = await readUserDoc(uid);
  return written || u;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const requestedMode = getDataMode();
  const preferredRoleRef = useRef<UserRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        if (requestedMode === 'firebase') {
          if (!isFirebaseConfigured || !firebaseAuth) {
            throw new Error(
              'VITE_DATA_MODE=firebase but Firebase is not configured.'
            );
          }

          const { onAuthStateChanged } = await import('firebase/auth');
          unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
            if (cancelled) return;
            if (!fbUser) {
              preferredRoleRef.current = null;
              setUser(null);
              setLoading(false);
              return;
            }

            void (async () => {
              let profile = await readUserDoc(fbUser.uid);
              if (!profile && preferredRoleRef.current) {
                try {
                  profile = await writeUserDoc(
                    fbUser.uid,
                    fbUser.email || '',
                    fbUser.displayName || '',
                    preferredRoleRef.current
                  );
                } catch {
                  /* keep null */
                }
              }
              if (cancelled) return;
              if (profile) {
                preferredRoleRef.current = null;
                setUser(authUserFromProfile(fbUser, profile));
              } else {
                // No Firestore profile — minimal patient session only as last resort
                setUser({
                  uid: fbUser.uid,
                  email: fbUser.email || '',
                  displayName: fbUser.displayName || fbUser.email || 'User',
                  role: preferredRoleRef.current || 'PATIENT',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });
              }
              setLoading(false);
            })();
          });

          setTimeout(() => {
            if (!cancelled) setLoading(false);
          }, 3000);
          return;
        }

        const repo = getRepositories();
        const uid = getSessionUid();
        if (uid) {
          const u = await repo.users.getById(uid);
          if (!cancelled && u && u.status === 'active') setUser(toAuthUser(u));
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setConfigError(err instanceof Error ? err.message : 'Configuration error');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [requestedMode]);

  const refreshProfile = useCallback(async () => {
    if (getDataMode() === 'firebase' && firebaseAuth?.currentUser) {
      const fb = firebaseAuth.currentUser;
      const profile = await readUserDoc(fb.uid);
      if (profile) setUser(authUserFromProfile(fb, profile));
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (getDataMode() === 'firebase') {
      if (!isFirebaseConfigured || !firebaseAuth) {
        throw new Error('Firebase Auth is not configured.');
      }
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password
        );

        let profile = await readUserDoc(cred.user.uid);
        if (!profile) {
          // Repair missing profile (old accounts) as PATIENT — admin must set role in Console
          profile = await writeUserDoc(
            cred.user.uid,
            cred.user.email || email,
            cred.user.displayName || email,
            'PATIENT'
          );
        }

        preferredRoleRef.current = null;
        setUser(authUserFromProfile(cred.user, profile));
        setLoading(false);
      } catch (e) {
        throw new Error(friendlyAuthError(e));
      }
      return;
    }
    const repo = getRepositories();
    const u = await repo.users.verifyPassword(email.trim(), password);
    if (!u || u.status !== 'active') {
      throw new Error('Email or password is incorrect.');
    }
    setSessionUid(u.uid);
    setUser(toAuthUser(u));
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: 'PATIENT' | 'PSYCHIATRIST'
    ) => {
      if (getDataMode() === 'firebase') {
        if (!isFirebaseConfigured || !firebaseAuth) {
          throw new Error('Firebase Auth is not configured.');
        }
        const { createUserWithEmailAndPassword, updateProfile, signOut } =
          await import('firebase/auth');

        let cred;
        try {
          cred = await createUserWithEmailAndPassword(
            firebaseAuth,
            email.trim(),
            password
          );
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }

        preferredRoleRef.current = role;
        try {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        } catch {
          /* non-fatal */
        }

        // CRITICAL: await Firestore profile write — do not redirect without it
        try {
          const profile = await writeUserDoc(
            cred.user.uid,
            email.trim(),
            displayName.trim(),
            role
          );
          setUser(authUserFromProfile(cred.user, profile));
          setLoading(false);
          setConfigError(null);
        } catch (writeErr) {
          // Profile write failed — sign out so user is not stuck as patient without role
          try {
            await signOut(firebaseAuth);
          } catch {
            /* ignore */
          }
          preferredRoleRef.current = null;
          setUser(null);
          throw new Error(
            writeErr instanceof Error
              ? `Account was created in login, but profile could not be saved: ${writeErr.message}. Check Firestore rules and try signing in, or contact support.`
              : 'Account was created but profile could not be saved to the database. Try signing in.'
          );
        }
        return;
      }

      const t = new Date().toISOString();
      const repo = getRepositories();
      const uid = `user-${Date.now()}`;
      const u: AppUser = {
        uid,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'active',
        createdAt: t,
        updatedAt: t,
      };
      await repo.users.create(u, password);
      setSessionUid(uid);
      setUser(toAuthUser(u));
    },
    []
  );

  const signOut = useCallback(async () => {
    preferredRoleRef.current = null;
    if (getDataMode() === 'firebase' && firebaseAuth) {
      const { signOut: fbSignOut } = await import('firebase/auth');
      await fbSignOut(firebaseAuth);
    }
    setSessionUid(null);
    setUser(null);
    setConfigError(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (getDataMode() !== 'firebase' || !firebaseAuth) {
      throw new Error('Password reset is only available when Firebase is connected.');
    }
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
  }, []);

  const resetDemoData = useCallback(async () => {
    if (getDataMode() !== 'local') {
      throw new Error('resetDemoData is only available in local development mode.');
    }
    const repo = getRepositories();
    if (repo.resetDemoData) await repo.resetDemoData();
    resetRepositoryCache();
    setSessionUid(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        mode: requestedMode === 'firebase' ? 'firebase' : 'local',
        configError,
        signIn,
        signUp,
        signOut,
        resetDemoData,
        refreshProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
