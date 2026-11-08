/**
 * Platform package pricing — set by admin, not by individual psychiatrists.
 * Default: $50 / week · 3 sessions. Commission = platformFeePercent of package.
 */

export interface PlatformPackage {
  amount: number;
  currency: string;
  sessionsPerWeek: number;
  label: string;
  /** Platform commission percent of package (e.g. 20 = 20%) */
  platformFeePercent: number;
}

const STORAGE_KEY = 'erkab_platform_pricing_v1';

function envDefaults(): PlatformPackage {
  const amount = Number(import.meta.env.VITE_PACKAGE_PRICE ?? 50) || 50;
  const sessionsPerWeek = Number(import.meta.env.VITE_PACKAGE_SESSIONS ?? 3) || 3;
  const currency = (import.meta.env.VITE_PACKAGE_CURRENCY as string) || 'USD';
  const platformFeePercent = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENT ?? 20) || 20;
  return {
    amount,
    currency,
    sessionsPerWeek,
    platformFeePercent,
    label: `${currency} ${amount} / week · ${sessionsPerWeek} online sessions`,
  };
}

function fromStorage(): PlatformPackage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PlatformPackage>;
    if (typeof p.amount !== 'number' || p.amount < 0) return null;
    const base = envDefaults();
    const amount = p.amount;
    const currency = p.currency || base.currency;
    const sessionsPerWeek = p.sessionsPerWeek ?? base.sessionsPerWeek;
    const platformFeePercent = p.platformFeePercent ?? base.platformFeePercent;
    return {
      amount,
      currency,
      sessionsPerWeek,
      platformFeePercent,
      label: `${currency} ${amount} / week · ${sessionsPerWeek} online sessions`,
    };
  } catch {
    return null;
  }
}

/** Sync read for UI — localStorage override then env defaults. */
export function getPlatformPackage(): PlatformPackage {
  return fromStorage() || envDefaults();
}

export function savePlatformPackageLocal(patch: {
  amount: number;
  currency?: string;
  sessionsPerWeek?: number;
  platformFeePercent?: number;
}): PlatformPackage {
  const cur = getPlatformPackage();
  const next: PlatformPackage = {
    amount: patch.amount,
    currency: patch.currency || cur.currency,
    sessionsPerWeek: patch.sessionsPerWeek ?? cur.sessionsPerWeek,
    platformFeePercent: patch.platformFeePercent ?? cur.platformFeePercent,
    label: '',
  };
  next.label = `${next.currency} ${next.amount} / week · ${next.sessionsPerWeek} online sessions`;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function platformFeeAmount(pkg: PlatformPackage = getPlatformPackage()): number {
  return Math.round(pkg.amount * (pkg.platformFeePercent / 100) * 100) / 100;
}

export function providerPayoutAmount(pkg: PlatformPackage = getPlatformPackage()): number {
  return Math.round((pkg.amount - platformFeeAmount(pkg)) * 100) / 100;
}
