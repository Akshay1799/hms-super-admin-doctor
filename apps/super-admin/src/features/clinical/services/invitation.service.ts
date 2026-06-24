/**
 * invitation.service.ts
 *
 * Simulates the doctor invitation flow using localStorage.
 * When the real backend is ready, replace each method body with an API call.
 * All components and hooks remain unchanged.
 *
 * localStorage key: "hms_invitations"
 * Storage: DoctorInvitation[] (shared between both apps via the browser)
 */

import { DoctorInvitation } from "../types/clinical.types";

const STORAGE_KEY = "hms_invitations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readStore(): DoctorInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(invitations: DoctorInvitation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations));
}

function generateToken(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getDoctorPortalBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (
      (process.env.NEXT_PUBLIC_DOCTOR_PORTAL_URL as string) ||
      "http://localhost:3000"
    );
  }
  return "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const invitationService = {
  /**
   * Create an invitation for a newly registered doctor.
   * REPLACE with: POST /api/invitations { doctorId, email, name }
   */
  createInvitation(doctor: {
    id: string;
    name: string;
    email: string;
  }): { invitation: DoctorInvitation; activationLink: string } {
    const token = generateToken();
    const invitation: DoctorInvitation = {
      token,
      doctorId: doctor.id,
      name: doctor.name,
      email: doctor.email,
      used: false,
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.push(invitation);
    writeStore(store);

    const activationLink = `${getDoctorPortalBaseUrl()}/activate-account?token=${token}`;
    return { invitation, activationLink };
  },

  /**
   * Look up an invitation by token.
   * REPLACE with: GET /api/invitations/:token
   */
  getInvitation(token: string): DoctorInvitation | null {
    const store = readStore();
    return store.find((inv) => inv.token === token) ?? null;
  },

  /**
   * Mark an invitation as used so it cannot be reused.
   * REPLACE with: PATCH /api/invitations/:token { used: true }
   */
  markUsed(token: string): void {
    const store = readStore();
    const idx = store.findIndex((inv) => inv.token === token);
    if (idx !== -1) {
      store[idx].used = true;
      writeStore(store);
    }
  },

  /**
   * List all pending (unused) invitations.
   * REPLACE with: GET /api/invitations?status=pending
   */
  listPending(): DoctorInvitation[] {
    return readStore().filter((inv) => !inv.used);
  },
};
