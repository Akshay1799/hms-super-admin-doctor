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
import { apiClient } from "@/lib/api-client";

const STORAGE_KEY = "hms_invitations";

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

function getDoctorPortalBaseUrl(): string {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem("hms_doctor_portal_url");
    if (override) return override;

    const envUrl = process.env.NEXT_PUBLIC_DOCTOR_PORTAL_URL;
    if (envUrl) return envUrl;

    if (process.env.NODE_ENV === "production") {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      let guessed = hostname;
      if (guessed.includes("super-admin")) {
        guessed = guessed.replace("super-admin", "doctor-portal");
      } else if (guessed.includes("admin")) {
        guessed = guessed.replace("admin", "doctor");
      }
      return `${protocol}//${guessed}`;
    }
  }
  return process.env.NEXT_PUBLIC_DOCTOR_PORTAL_URL || "http://localhost:3000";
}

function encodeToken(payload: any): string {
  const str = JSON.stringify(payload);
  if (typeof window !== "undefined") {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str).toString("base64");
}

export const invitationService = {
  async createInvitation(doctor: {
    name: string;
    email: string;
    specialty?: string;
    hospitalId?: string;
    departmentId?: string;
    qualifications?: string[];
    experience?: number;
    phone?: string;
  }): Promise<{ invitation: DoctorInvitation; activationLink: string }> {
    try {
      const res = await apiClient.post("/users/doctors/invite", doctor);
      const data = res.data.data;
      
      const invitation: DoctorInvitation = {
        token: data.token,
        doctorId: data.doctor._id,
        name: data.doctor.name,
        email: data.doctor.email,
        used: false,
        createdAt: data.doctor.createdAt,
      };

      const activationLink = `${getDoctorPortalBaseUrl()}/activate-account?token=${encodeURIComponent(data.token)}`;
      return { invitation, activationLink };
    } catch (error) {
      // Fallback
      const payload = {
        doctorId: "doc-" + Date.now(),
        name: doctor.name,
        email: doctor.email,
        createdAt: new Date().toISOString()
      };
      const token = encodeToken(payload);

      const invitation: DoctorInvitation = {
        token,
        doctorId: payload.doctorId,
        name: doctor.name,
        email: doctor.email,
        used: false,
        createdAt: payload.createdAt,
      };

      const store = readStore();
      store.push(invitation);
      writeStore(store);

      const activationLink = `${getDoctorPortalBaseUrl()}/activate-account?token=${encodeURIComponent(token)}`;
      return { invitation, activationLink };
    }
  },

  async getInvitation(token: string): Promise<DoctorInvitation | null> {
    try {
      // The invitation record is managed on backend activation automatically, 
      // but we return the mapped structure if needed.
      const store = readStore();
      return store.find((inv) => inv.token === token) ?? null;
    } catch {
      return null;
    }
  },

  async markUsed(token: string): Promise<void> {
    try {
      const store = readStore();
      const idx = store.findIndex((inv) => inv.token === token);
      if (idx !== -1) {
        store[idx].used = true;
        writeStore(store);
      }
    } catch {}
  },

  async listPending(): Promise<DoctorInvitation[]> {
    return readStore().filter((inv) => !inv.used);
  },
};
