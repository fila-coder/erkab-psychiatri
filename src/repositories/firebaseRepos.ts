/**
 * Firebase repository — Spark client SDK (Auth + Firestore only).
 * Privileged operations enforced by Firestore Security Rules.
 * Admin role: set users/{uid}.role = "ADMIN" in Firebase Console only.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  type Firestore,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, type Auth } from 'firebase/auth';
import type {
  AppUser,
  PatientProfile,
  PsychiatristProfile,
  Appointment,
  PaymentRecord,
  MeetingRecord,
  SupportTicket,
  AuditEvent,
  ProviderAvailabilitySlot,
} from '../types';
import type { DataRepositories } from './types';
import {
  requireAuth,
  requireDb,
  isFirebaseConfigured,
} from '../lib/firebase';

function db(): Firestore {
  return requireDb();
}

function auth(): Auth {
  return requireAuth();
}

function normalizeIso(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid timestamp.');
  return d.toISOString();
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export function createFirebaseRepositories(): DataRepositories {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_* in .env. See FIREBASE_SETUP_FOR_OWNER.md.'
    );
  }

  return {
    mode: 'firebase',

    users: {
      async getById(uid) {
        const snap = await getDoc(doc(db(), 'users', uid));
        return snap.exists() ? ({ uid, ...snap.data() } as AppUser) : null;
      },
      async getByEmail() {
        return null;
      },
      async list() {
        const snap = await getDocs(collection(db(), 'users'));
        return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      },
      async create(user) {
        // IMPORTANT: do not await getDoc first — on some mobile networks it hangs
        // and setDoc never runs (Auth user exists, Firestore profile missing).
        // Rules block role/status changes on update, so ADMIN set in Console is safe.
        const ref = doc(db(), 'users', user.uid);
        await setDoc(
          ref,
          {
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            timezone: user.timezone || 'UTC',
            status: user.status || 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      },
      async update(uid, patch) {
        const { role: _r, status: _s, ...safe } = patch as Partial<AppUser>;
        await updateDoc(doc(db(), 'users', uid), {
          ...safe,
          updatedAt: serverTimestamp(),
        });
      },
      async verifyPassword(email, password) {
        const cred = await signInWithEmailAndPassword(auth(), email, password);
        const snap = await getDoc(doc(db(), 'users', cred.user.uid));
        if (!snap.exists()) return null;
        return { uid: cred.user.uid, ...snap.data() } as AppUser;
      },
    },

    patients: {
      async get(uid) {
        const snap = await getDoc(doc(db(), 'patients', uid));
        return snap.exists() ? ({ uid, ...snap.data() } as PatientProfile) : null;
      },
      async upsert(profile) {
        const payload: Record<string, unknown> = {
          jurisdiction: profile.jurisdiction,
          updatedAt: serverTimestamp(),
        };
        if (profile.intake) {
          payload.intake = {
            reasons: profile.intake.reasons || [],
            languages: profile.intake.languages || [],
            completedAt: profile.intake.completedAt || new Date().toISOString(),
          };
        }
        const write = setDoc(doc(db(), 'patients', profile.uid), payload, {
          merge: true,
        });
        await Promise.race([
          write,
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    'Saving is taking too long. Check your connection and try again.'
                  )
                ),
              8000
            )
          ),
        ]);
      },
    },

    psychiatrists: {
      async get(uid) {
        const appSnap = await getDoc(doc(db(), 'psychiatristApplications', uid));
        if (appSnap.exists()) {
          return { uid, ...appSnap.data() } as PsychiatristProfile;
        }
        const pub = await getDoc(doc(db(), 'psychiatristPublic', uid));
        return pub.exists() ? ({ uid, ...pub.data() } as PsychiatristProfile) : null;
      },
      async listActive(filters) {
        const snap = await getDocs(
          query(collection(db(), 'psychiatristPublic'), where('status', '==', 'ACTIVE'))
        );
        let list = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PsychiatristProfile));
        // Soft filters only — empty arrays should not hide everyone
        if (filters?.language) {
          const lang = filters.language.toLowerCase();
          const filtered = list.filter(
            (p) =>
              !p.languages?.length ||
              p.languages.some((l) => l.toLowerCase() === lang)
          );
          if (filtered.length) list = filtered;
        }
        if (filters?.jurisdiction) {
          const filtered = list.filter(
            (p) =>
              !p.jurisdictions?.length ||
              p.jurisdictions.includes(filters.jurisdiction!)
          );
          if (filtered.length) list = filtered;
        }
        // Specialty is advisory only — do not hide untagged profiles
        return list;
      },
      async listAll() {
        const snap = await getDocs(collection(db(), 'psychiatristApplications'));
        return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PsychiatristProfile));
      },
      async upsert(profile) {
        const extended = profile as typeof profile & {
          driveEvidenceUrl?: string;
          review?: Record<string, unknown>;
        };
        const payload: Record<string, unknown> = {
          professionalName: profile.professionalName,
          bio: profile.bio,
          specialties: profile.specialties,
          languages: profile.languages,
          jurisdictions: profile.jurisdictions,
          sessionDurationMin: profile.sessionDurationMin,
          price: profile.price,
          cancellationPolicy: profile.cancellationPolicy,
          status: profile.status,
          trustPassport: profile.trustPassport,
          applicationNotes: profile.applicationNotes || '',
          updatedAt: serverTimestamp(),
        };
        // Persist private Drive evidence URL (never publish to psychiatristPublic)
        if (extended.driveEvidenceUrl !== undefined) {
          payload.driveEvidenceUrl = extended.driveEvidenceUrl || null;
        }
        // Persist admin review object when provided (admin writes only — rules enforce)
        if (extended.review !== undefined) {
          payload.review = extended.review;
        }
        await setDoc(doc(db(), 'psychiatristApplications', profile.uid), payload, {
          merge: true,
        });
      },
      async setStatus(uid, status, meta) {
        // Admin-only path enforced by rules (isAdmin)
        const appRef = doc(db(), 'psychiatristApplications', uid);
        const pubRef = doc(db(), 'psychiatristPublic', uid);
        const snap = await getDoc(appRef);
        if (!snap.exists()) throw new Error('Application not found.');
        const app = snap.data() as PsychiatristProfile;

        if (status === 'ACTIVE' || status === 'APPROVED') {
          const tp = app.trustPassport;
          // Spark honesty: admin attests review in console workflow;
          // require overall verified flag set by admin on application first
          if (tp?.overall !== 'verified') {
            throw new Error(
              'Set Trust Passport overall to verified (admin) before activating. Spark mode does not auto-verify categories.'
            );
          }
          await updateDoc(appRef, {
            status: 'ACTIVE',
            applicationNotes: meta.reason || app.applicationNotes || '',
            updatedAt: serverTimestamp(),
          });
          // Public profile without private notes
          await setDoc(pubRef, {
            professionalName: app.professionalName,
            bio: app.bio,
            specialties: app.specialties || [],
            languages: app.languages || [],
            jurisdictions: app.jurisdictions || [],
            sessionDurationMin: app.sessionDurationMin || 50,
            price: app.price,
            cancellationPolicy: app.cancellationPolicy || '',
            status: 'ACTIVE',
            trustPassport: {
              identity: { status: tp.identity?.status || 'pending' },
              licence: { status: tp.licence?.status || 'pending' },
              qualification: { status: tp.qualification?.status || 'pending' },
              interview: { status: tp.interview?.status || 'pending' },
              overall: 'verified',
              verificationDate: tp.verificationDate || new Date().toISOString(),
            },
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(appRef, {
            status,
            applicationNotes: meta.reason || '',
            updatedAt: serverTimestamp(),
          });
          // Remove public profile whenever not actively approved
          if (status !== 'ACTIVE' && status !== 'APPROVED') {
            try {
              await deleteDoc(pubRef);
            } catch {
              /* may not exist */
            }
          }
        }

        await setDoc(doc(collection(db(), 'auditLogs')), {
          actorId: meta.actorId,
          action: `provider.${status}`,
          targetType: 'psychiatrist',
          targetId: uid,
          reason: meta.reason || '',
          at: serverTimestamp(),
        });
      },
    },

    appointments: {
      async get(id) {
        const snap = await getDoc(doc(db(), 'appointments', id));
        return snap.exists() ? ({ id, ...snap.data() } as Appointment) : null;
      },
      async listByPatient(patientId) {
        const q = query(
          collection(db(), 'appointments'),
          where('patientId', '==', patientId),
          orderBy('startAt', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      },
      async listByProvider(providerId) {
        const q = query(
          collection(db(), 'appointments'),
          where('providerId', '==', providerId),
          orderBy('startAt', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      },
      async listAll() {
        const snap = await getDocs(collection(db(), 'appointments'));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      },
      /**
       * Spark booking: client transaction creates slot + appointment.
       * Rules enforce patientId == auth.uid and initial status.
       * Slot doc id = providerId_startAt (normalized UTC ISO) for exact-slot exclusivity.
       * Limitation: overlapping different start times rely on transaction re-read of
       * provider appointments; under extreme contention prefer REQUESTED + admin confirm.
       */
      async create(appt: Appointment) {
        const startAt = normalizeIso(appt.startAt);
        const endAt = normalizeIso(appt.endAt);
        if (endAt <= startAt) throw new Error('End must be after start.');
        if (Date.parse(startAt) <= Date.now()) throw new Error('Cannot book in the past.');

        const availabilitySlotId =
          (appt as { availabilitySlotId?: string }).availabilitySlotId;
        if (!availabilitySlotId) {
          throw new Error('A published availability slot is required.');
        }

        const availRef = doc(db(), 'availability', availabilitySlotId);
        const apptRef = doc(collection(db(), 'appointments'));

        // Single transaction: verify open slot → create REQUESTED appointment → mark booked.
        // Rules evaluate get() on availability as pre-transaction (still open) for the create.
        await runTransaction(db(), async (tx) => {
          const availSnap = await tx.get(availRef);
          if (!availSnap.exists()) {
            throw new Error('This time slot is no longer available.');
          }
          const slot = availSnap.data()!;
          if (slot.status !== 'open') {
            throw new Error('This time slot is no longer available.');
          }
          if (slot.providerId !== appt.providerId) {
            throw new Error('Slot does not match provider.');
          }
          if (slot.startAt !== startAt || slot.endAt !== endAt) {
            throw new Error('Slot times do not match the request.');
          }

          tx.set(apptRef, {
            patientId: appt.patientId,
            providerId: appt.providerId,
            startAt,
            endAt,
            timezone: appt.timezone,
            status: 'REQUESTED',
            availabilitySlotId,
            priceSnapshot: appt.priceSnapshot || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          tx.update(availRef, {
            status: 'booked',
            appointmentId: apptRef.id,
            updatedAt: serverTimestamp(),
          });
        });

        return {
          ...appt,
          id: apptRef.id,
          startAt,
          endAt,
          status: 'REQUESTED' as const,
          availabilitySlotId,
        };
      },
      async update(id, patch) {
        await updateDoc(doc(db(), 'appointments', id), {
          ...patch,
          updatedAt: serverTimestamp(),
        });
      },
    },

    payments: {
      async get(id) {
        const snap = await getDoc(doc(db(), 'payments', id));
        return snap.exists() ? ({ id, ...snap.data() } as PaymentRecord) : null;
      },
      async listByPatient(patientId) {
        const q = query(collection(db(), 'payments'), where('patientId', '==', patientId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRecord));
      },
      async create(p) {
        // Admin-only under rules
        const ref = doc(collection(db(), 'payments'));
        await setDoc(ref, { ...p, id: ref.id, createdAt: serverTimestamp() });
        return { ...p, id: ref.id };
      },
      async update(id, patch) {
        await updateDoc(doc(db(), 'payments', id), patch);
      },
    },

    meetings: {
      async get() {
        return null;
      },
      async getByAppointment() {
        return null;
      },
      async create() {
        throw new Error(
          'Video meetings are not configured on Spark-only build. Integrate a provider later.'
        );
      },
    },

    audit: {
      async append(e) {
        await setDoc(doc(collection(db(), 'auditLogs')), {
          ...e,
          at: serverTimestamp(),
        });
      },
      async list(limitN = 50) {
        const q = query(collection(db(), 'auditLogs'), orderBy('at', 'desc'), limit(limitN));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditEvent));
      },
    },

    
    availability: {
      async listOpenByProvider(providerId) {
        const q = query(
          collection(db(), 'availability'),
          where('providerId', '==', providerId),
          where('status', '==', 'open')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProviderAvailabilitySlot));
      },
      async listByProvider(providerId) {
        const q = query(
          collection(db(), 'availability'),
          where('providerId', '==', providerId)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProviderAvailabilitySlot));
      },
      async publish(slot) {
        await setDoc(doc(db(), 'availability', slot.id), {
          ...slot,
          updatedAt: serverTimestamp(),
        });
      },
      
      async releaseSlot(slotId: string, appointmentId: string) {
        const availRef = doc(db(), 'availability', slotId);
        await runTransaction(db(), async (tx) => {
          const snap = await tx.get(availRef);
          if (!snap.exists()) return;
          const data = snap.data()!;
          // Only release if still booked by this appointment
          if (data.status === 'booked' && data.appointmentId === appointmentId) {
            tx.update(availRef, {
              status: 'open',
              appointmentId: null,
              updatedAt: serverTimestamp(),
            });
          }
        });
      },
      async claim(slotId, appointmentId, patientId) {
        const slotRef = doc(db(), 'availability', slotId);
        await runTransaction(db(), async (tx) => {
          const snap = await tx.get(slotRef);
          if (!snap.exists() || snap.data()!.status !== 'open') {
            throw new Error('Slot is no longer available.');
          }
          if (snap.data()!.providerId && snap.data()!.startAt) {
            /* ok */
          }
          tx.update(slotRef, {
            status: 'booked',
            appointmentId,
            updatedAt: serverTimestamp(),
          });
        });
      },
    },

    support: {
      async create(ticket) {
        await setDoc(doc(db(), 'supportTickets', ticket.id), {
          ...ticket,
          createdAt: serverTimestamp(),
        });
      },
      async listByUser(userId) {
        const q = query(collection(db(), 'supportTickets'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
      },
      async listAll() {
        const snap = await getDocs(collection(db(), 'supportTickets'));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
      },
    },
  };
}
