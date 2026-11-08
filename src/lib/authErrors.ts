/** Map Firebase Auth error codes to plain-language messages. */

export function friendlyAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const codeMatch = raw.match(/auth\/([a-z0-9-]+)/i);
  const code = codeMatch?.[1]?.toLowerCase() || '';

  const map: Record<string, string> = {
    'email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'invalid-email': 'Please enter a valid email address.',
    'weak-password': 'Password is too weak. Use at least 8 characters.',
    'wrong-password': 'Incorrect password. Try again or reset your password.',
    'user-not-found': 'No account found with this email. Check the address or create an account.',
    'invalid-credential': 'Email or password is incorrect. Try again or reset your password.',
    'too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'network-request-failed': 'Network error. Check your connection and try again.',
    'user-disabled': 'This account has been disabled. Contact support.',
    'operation-not-allowed': 'This sign-in method is not enabled. Contact support.',
    'requires-recent-login': 'Please sign out and sign in again to continue.',
    'missing-email': 'Please enter your email address.',
  };

  if (code && map[code]) return map[code];
  if (/email-already|already-in-use/i.test(raw)) return map['email-already-in-use'];
  if (/wrong-password|invalid-credential/i.test(raw)) return map['invalid-credential'];
  if (/weak-password/i.test(raw)) return map['weak-password'];
  if (/invalid-email/i.test(raw)) return map['invalid-email'];
  if (/user-not-found/i.test(raw)) return map['user-not-found'];
  if (/network/i.test(raw)) return map['network-request-failed'];

  // Strip Firebase prefix noise
  const cleaned = raw
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/[^)]+\)\.?/i, '')
    .trim();
  return cleaned || 'Something went wrong. Please try again.';
}
