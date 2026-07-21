# HMS (Hospital Management System) — Full Architecture & Backend Guide

> **Purpose**: This document describes the complete frontend architecture, feature set, user flows, and data models for the HMS monorepo. It is the authoritative reference for building a production-ready Express backend that replaces the current mock-service layer.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Principle](#4-architecture-principle)
5. [Authentication & Session Management](#5-authentication--session-management)
6. [Super Admin Portal — Full Flow & Features](#6-super-admin-portal--full-flow--features)
7. [Doctor Portal — Full Flow & Features](#7-doctor-portal--full-flow--features)
8. [Shared Data Models (Entity Reference)](#8-shared-data-models-entity-reference)
9. [State Management (Zustand Stores)](#9-state-management-zustand-stores)
10. [Mock Service Layer (Current Implementation)](#10-mock-service-layer-current-implementation)
11. [Backend Integration Guide (Express)](#11-backend-integration-guide-express)
12. [API Endpoint Reference](#12-api-endpoint-reference)
13. [Database Schema Recommendations](#13-database-schema-recommendations)
14. [Security & Production Checklist](#14-security--production-checklist)

---

## 1. Project Overview

**MediChain HMS** is a multi-tenant, SaaS-based Hospital Management System delivered as two separate Next.js applications in a single monorepo:

| Portal | Port | Audience | Scope |
|---|---|---|---|
| `super-admin` | `3001` | Platform owner | Platform-wide: tenants, hospitals, billing, IAM, monitoring |
| `doctor-portal` | `3000` | Clinical doctors | Clinical: patients, appointments, prescriptions, EMR |

### Multi-Tenancy Model

```
Platform (Super Admin)
  └─ Tenant (e.g., "Apollo Group")        ← tenantId
       └─ Hospital (e.g., "Apollo Delhi")  ← hospitalId
            └─ Branch (e.g., "Saket")      ← branchId
                 └─ Department             ← departmentId
                      ├─ Doctors
                      ├─ Nurses
                      └─ Staff
```

- `SUPER_ADMIN` has `tenantId: null` — operates across all tenants.
- `DOCTOR` has a non-null `tenantId`, `hospitalId`, and `specialty` — scoped to their hospital.

---

## 2. Monorepo Structure

```
hms-monorepo/                    ← root (npm workspaces)
├── package.json                 ← workspace root
├── apps/
│   ├── super-admin/             ← Next.js app (port 3001)
│   │   └── src/
│   │       ├── app/             ← Next.js App Router (pages/layouts)
│   │       │   ├── (auth)/      ← login, forgot-password, reset-password
│   │       │   └── (dashboard)/ ← all protected routes (53 route segments)
│   │       ├── features/        ← feature-sliced modules
│   │       │   ├── auth/
│   │       │   ├── tenants/
│   │       │   ├── hospitals/
│   │       │   ├── clinical/
│   │       │   ├── billing/
│   │       │   ├── iam/
│   │       │   ├── audit/
│   │       │   ├── notifications/
│   │       │   ├── integrations/
│   │       │   ├── monitoring/
│   │       │   ├── reports/
│   │       │   └── settings/
│   │       ├── store/           ← Zustand stores (auth, sidebar, theme)
│   │       ├── providers/       ← AuthProvider (route guard + inactivity)
│   │       ├── components/      ← shared UI components
│   │       ├── constants/       ← routes, config
│   │       ├── hooks/           ← shared hooks
│   │       ├── lib/             ← utility functions
│   │       ├── mocks/           ← global mock data
│   │       └── types/           ← global type declarations
│   │
│   └── doctor-portal/           ← Next.js app (port 3000)
│       └── src/
│           ├── app/
│           │   ├── (auth)/      ← login, activate-account, forgot-password, reset-password
│           │   └── (dashboard)/ ← dashboard, my-patients, appointments, reports, settings
│           ├── features/
│           │   ├── auth/
│           │   ├── patients/
│           │   ├── appointments/
│           │   ├── clinical/
│           │   ├── dashboard/
│           │   └── notifications/
│           ├── store/
│           ├── providers/
│           ├── components/
│           └── constants/
│
└── packages/                    ← shared packages (currently skeleton stubs)
    ├── ui/
    ├── hooks/
    ├── schemas/
    ├── types/
    ├── constants/
    └── api-client/              ← future: Axios/fetch wrapper goes here
```

Each `feature/` module follows a consistent internal structure:

```
features/<name>/
├── components/   ← UI components specific to this feature
├── hooks/        ← TanStack Query hooks (useFeature, useMutateFeature)
├── services/     ← service.ts — async functions (currently hits localStorage)
├── mocks/        ← mock data arrays/objects
├── schemas/      ← Zod validation schemas (for forms)
└── types/        ← TypeScript interfaces for this domain
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS variables (design tokens) |
| UI Components | Shadcn/UI (Radix-based) |
| Server State | TanStack Query v5 (React Query) |
| Client State | Zustand + `persist` middleware |
| Forms | React Hook Form + Zod |
| Charts | Recharts (dynamically imported via `next/dynamic`) |
| Icons | Lucide React |
| HTTP Client | Native `fetch` (future: Axios in `packages/api-client`) |
| Linting | ESLint (Next.js config) |

---

## 4. Architecture Principle

The data flow is strictly layered — **never fetch inside components**:

```
React Component
      ↓
TanStack Query Hook  (useQuery / useMutation)
      ↓
Service Function     (async, currently returns mock data)
      ↓
Mock Data / localStorage
      ↓  (future)
Express REST API
```

**Why this matters for the backend**: Swapping the mock for a real API only requires changing the `service.ts` files. Components and hooks stay untouched.

---

## 5. Authentication & Session Management

### 5.1 Super Admin Authentication

| Field | Value |
|---|---|
| Mock email | `admin@medichain.com` |
| Mock role | `SUPER_ADMIN` |
| tenantId | `null` (platform-level) |
| Storage key | `hms_super_admin_auth` (localStorage via Zustand persist) |
| Session timeout | 30 minutes inactivity → warning modal → auto-logout |

**Login flow:**
```
POST /auth/login
  email: admin@medichain.com
  password: <any>
→ Returns: { accessToken, refreshToken, user }
→ Stored in Zustand (persisted to localStorage)
→ AuthProvider hydration guard prevents premature redirect on refresh
```

### 5.2 Doctor Authentication

| Field | Value |
|---|---|
| Mock email | `doctor@medichain.com` |
| Mock role | `DOCTOR` |
| tenantId | `tenant-1` |
| hospitalId | `hosp-1` |
| Storage key | `hms_doctor_auth` |
| Accounts storage | `hms_doctor_accounts` (activated doctors) |
| Invitations storage | `hms_invitations` |

**Doctor onboarding flow (invitation-based, no self-signup):**
```
Super Admin creates Doctor (clinical module)
       ↓
System generates invitation token (Base64 encoded JSON: {doctorId, name, email})
       ↓
Token stored in localStorage: hms_invitations
       ↓
Doctor visits: /activate-account?token=<base64>
       ↓
Doctor sets password → account saved to hms_doctor_accounts
       ↓
Doctor logs in at /login
       ↓
Matched against hms_doctor_accounts → JWT issued
```

### 5.3 Session Persistence (Hydration Guard)

Both `AuthProvider` components use Zustand's `onFinishHydration` to prevent redirect-on-refresh issues:

```typescript
useEffect(() => {
  if (useAuthStore.persist.hasHydrated()) {
    setHasHydrated(true);
  } else {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => unsub();
  }
}, []);
```

Route guard only runs **after** hydration is confirmed.

### 5.4 Inactivity Timeout

Both portals implement a 30-minute inactivity auto-logout:
- User activity events (`mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`) reset the timer
- After 30 min of inactivity, a `SessionModal` warning appears with a 30-second countdown
- If no action taken, the user is automatically logged out

### 5.5 Public vs Protected Routes

| Portal | Public Routes |
|---|---|
| Super Admin | `/login`, `/forgot-password`, `/reset-password`, `/design-system` |
| Doctor | `/login`, `/activate-account`, `/forgot-password`, `/reset-password` |

All other routes require authentication. Unauthenticated users are redirected to `/login`.

---

## 6. Super Admin Portal — Full Flow & Features

The Super Admin is the **platform owner** — they see and manage everything across all tenants and hospitals.

### 6.1 Route Map

| Route | Feature |
|---|---|
| `/dashboard` | Overview KPIs, revenue chart, bed occupancy, quick actions |
| `/tenants` | Multi-tenant management |
| `/hospitals` | Hospital CRUD with branches/departments |
| `/doctors` | Clinical: doctor management + invitation flow |
| `/nurses` | Clinical: nurse management |
| `/staff` | Clinical: non-clinical staff |
| `/patients` | Clinical: patient records (read-level) |
| `/appointments` | Clinical: appointment records |
| `/admissions` | Clinical: IPD/OPD/Emergency admissions |
| `/bed-occupancy` | Clinical: real-time bed tracking |
| `/clinical-analytics` | Clinical: aggregate analytics |
| `/revenue` | Billing: revenue metrics |
| `/invoices` | Billing: invoice management |
| `/payments` | Billing: payment records |
| `/claims` | Billing: insurance claim tracking |
| `/refunds` | Billing: refund management |
| `/subscriptions` | Billing: tenant subscription management |
| `/financial-reports` | Reports: revenue, P&L, department breakdowns |
| `/users` | IAM: user management (all roles) |
| `/roles` | IAM: role definitions |
| `/permissions` | IAM: permission matrix |
| `/sessions` | IAM: active session management |
| `/login-history` | IAM: login audit trail |
| `/mfa` | IAM: MFA configuration |
| `/mfa-settings` | IAM: per-user MFA settings |
| `/notifications` | Notifications: inbox |
| `/templates` | Notifications: message templates |
| `/broadcasts` | Notifications: mass notifications |
| `/delivery-logs` | Notifications: delivery tracking |
| `/notification-analytics` | Notifications: channel analytics |
| `/integrations` | Integrations: all connected services |
| `/payment-gateways` | Integrations: Razorpay, Stripe, etc. |
| `/insurance-providers` | Integrations: insurance APIs |
| `/hl7-fhir` | Integrations: HL7/FHIR EMR standards |
| `/email-providers` | Integrations: SMTP/SendGrid/SES |
| `/sms-providers` | Integrations: Twilio/MSG91 |
| `/whatsapp-providers` | Integrations: Meta WhatsApp/Gupshup |
| `/storage` | Integrations: S3/Cloudinary |
| `/webhooks` | Integrations: outbound webhook config |
| `/api-keys` | Integrations: API key management |
| `/monitoring` | Monitoring: overview dashboard |
| `/system-health` | Monitoring: service health |
| `/api-health` | Monitoring: API endpoint health/latency |
| `/database-health` | Monitoring: PostgreSQL/Redis/Mongo |
| `/queue-monitor` | Monitoring: Bull/BullMQ queues |
| `/job-monitor` | Monitoring: background job records |
| `/storage-monitor` | Monitoring: storage usage trends |
| `/error-tracker` | Monitoring: error logs |
| `/uptime` | Monitoring: uptime history |
| `/service-status` | Monitoring: public status page data |
| `/audit` | Audit: system-wide audit logs |
| `/reports` | Reports: downloadable reports |
| `/settings` | Platform settings |

### 6.2 Super Admin Feature Details

#### Tenant Management
- Create, view, update, suspend, delete tenants
- Per-tenant: subscription plan, domain config, feature flags, usage quotas
- Feature flags: `emr`, `appointments`, `billing`, `pharmacy`, `inventory`, `laboratory`, `radiology`, `insurance`, `telemedicine`, `notifications`, `reports`
- Usage quotas: hospitals, branches, doctors, staff, patients, storage, API calls

#### Hospital Management
- CRUD for hospitals with: type, status, branch count, doctor/patient/bed counts
- Hospital sub-entities: branches, departments
- Hospital details: capacity (beds, ICU, OT, ambulance), accreditation (NABH, JCI, ISO), settings (timezone, currency, language)

#### Clinical Module (Super Admin View)
- **Doctors**: view/manage all doctors across hospitals. Invite doctors via invitation flow (token-based)
- **Patients**: read-only patient registry across all hospitals
- **Appointments**: read-only cross-hospital appointment records
- **Bed Occupancy**: real-time aggregate bed tracking per hospital/branch
- **Admissions**: IPD/OPD/Emergency records

#### Billing Module
- **Revenue**: metrics with trends (MoM comparisons)
- **Invoices**: create/update/cancel; linked to tenant/hospital/patient
- **Payments**: track by method (credit card, bank transfer, cash, insurance)
- **Claims**: insurance claim lifecycle (submitted → approved/rejected)
- **Refunds**: refund processing with status tracking
- **Subscriptions**: tenant SaaS subscription billing cycles

#### IAM (Identity & Access Management)
- **Users**: full CRUD for all user accounts (doctors, nurses, staff, hospital admins)
- **Roles**: define role templates with permission arrays (e.g., `"users:read"`, `"hospitals:create"`)
- **Permissions**: fine-grained permission matrix
- **Sessions**: view/terminate active sessions
- **Login History**: per-user login audit with device/IP/location
- **MFA**: enable/disable MFA per user; methods: Email OTP, SMS OTP, Authenticator App

#### Notifications Module
- **Templates**: create notification templates by category (appointment, billing, security, etc.) and channel (email, SMS, WhatsApp, in-app)
- **Broadcasts**: send mass notifications to audience segments (all-tenants, specific-tenant, doctors, etc.)
- **Delivery Logs**: per-message delivery tracking with retry count
- **Analytics**: delivery rate, open rate, CTR by channel

#### Integrations Module
- **Payment Gateways**: Razorpay, Stripe, PayPal, Cashfree, PayU
- **Insurance Providers**: government, private, corporate
- **HL7/FHIR**: EMR interoperability endpoints
- **Email**: SMTP, SendGrid, Amazon SES, Mailgun
- **SMS**: Twilio, MSG91, Textlocal
- **WhatsApp**: Twilio, Meta WhatsApp, Gupshup
- **Storage**: AWS S3, Cloudinary, local
- **Webhooks**: configure outbound webhooks for events (patient.created, invoice.generated, etc.)
- **API Keys**: manage external API credentials

#### Monitoring Module
- **System Health**: per-service health status, response time, uptime %
- **API Health**: per-endpoint latency (avg, P95), RPM, error rate
- **Database Health**: connection pools, QPS, CPU/memory for PostgreSQL, Redis, MongoDB
- **Queue Monitor**: BullMQ queue depths (emails, notifications, invoices, reports, claims)
- **Job Monitor**: individual background job records with status/errors
- **Storage Monitor**: usage trends, file type breakdown
- **Error Tracker**: service error logs with severity (info/warning/error/critical) and stack traces
- **Uptime**: historical uptime % and downtime minutes

#### Audit Module
- **Audit Logs**: all system events with module, action, entity, user, severity, status
- **Security Events**: unauthorized access attempts, policy violations
- **Data Access**: PHI/sensitive data access records (HIPAA compliance)
- **Access History**: full login/logout history with device fingerprint
- **Compliance Stats**: HIPAA events, PHI access count, export events

---

## 7. Doctor Portal — Full Flow & Features

The Doctor Portal is a **clinical workstation** — scoped entirely to the doctor's assigned hospital and their patient list.

### 7.1 Route Map

| Route | Feature |
|---|---|
| `/dashboard` | Today's stats, charts, quick actions, alerts |
| `/my-patients` | Patient list (table + card view) |
| `/my-patients/:id` | Patient 360° — full clinical record |
| `/appointments` | Appointment calendar (day/week/month) |
| `/reports` | Doctor-level clinical reports |
| `/settings` | Profile, availability, preferences |

### 7.2 Authentication Flow

```
No self-registration allowed.

Super Admin / Hospital Admin
       ↓  creates Doctor record
System generates invitation token
       ↓  (Base64: {doctorId, name, email})
Doctor activates at /activate-account
       ↓  sets password
Account persisted (localStorage → future: DB)
       ↓
Doctor logs in at /login
```

### 7.3 Dashboard Features

**Stat Cards:**
- Today's Appointments
- Waiting Patients
- Critical Patients
- Follow-ups Due

**Charts (Recharts, dynamically loaded):**
- Appointments Trend (7-day line chart)
- Patients Trend (7-day area chart)

**Quick Actions:**
- Open Patient (→ `/my-patients`)
- Create Prescription (→ `/my-patients`)
- Schedule Follow-up (→ `/appointments`)

**Clinical Alerts Panel:**
- ⚠ Penicillin Allergy
- ⚠ Critical Lab Value
- ⚠ Follow-up Due

### 7.4 Patient Management (My Patients)

**List View Features:**
- Table view and card view toggle
- Search by patient name
- Filter by status: `Active | Admitted | ICU | Follow-up Due`
- Risk indicators (allergy badges, status chips)

**Patient CRUD:**
- Create patient (via modal form)
- Update patient details
- Delete patient (soft-delete in real backend)

**Patient Entity Fields:**
```
id, name, age, gender, bedNumber, ward, status
allergies[], medicalHistory[]
assignedDoctorId, assignedNurse, assignedCompounder, shift
vitals[], medications[], diagnoses[], soapNotes[]
timeline[], billing[], audits[], scans[]
```

### 7.5 Patient 360° (Clinical Detail View)

The most feature-rich page. Implemented incrementally across sub-tabs:

**Tab: Overview**
- Patient header: demographics, allergies banner, medical history
- Risk banner: allergy warnings, active conditions

**Tab: Vitals**
- Vital signs history with trend charts (BP, Temperature, Weight, SpO₂)
- Record new vitals

**Tab: Care & Medications**
- Current medications list with dose/frequency/timing
- Medication administration history (prescribed by, administered by, dates)
- Assigned nurse, compounder, shift, ward, bed number
- Injection history + IV Fluids

**Tab: Clinical Documentation**
- **SOAP Notes**: Subjective / Objective / Assessment / Plan (create + history)
- **Diagnoses**: ICD code + description; status Active/Resolved
- **Progress Notes**
- **Lab Orders**: X-Ray, CT, MRI, ECG, Ultrasound
- **Lab Results**: trend charts for HbA1c, Creatinine, Hemoglobin
- **Radiology Reports + Imaging Viewer** (read-only, download)
- **Documents**: uploaded patient documents
- **Discharge Summaries**
- **Procedures**: Surgery, Dialysis, Endoscopy, Biopsy (read-only history)

**Tab: Timeline**
- Chronological event history: admission, diagnosis, prescription, vital, discharge

**Tab: Billing (Read Only)**
- Invoice list for this patient with amounts and status (Paid/Unpaid/Refunded)

**Tab: Audit Logs (Read Only)**
- All actions performed on this patient record with IP address

### 7.6 Appointments

**Views:** Day | Week | Month (calendar grid)

**Appointment Fields:**
```
id, patientName, patientId, date, time
type: Consultation | Follow-up | Diagnostic | Therapy
status: Scheduled | Waiting | Completed | Cancelled
symptoms, notes
```

**Actions:** View detail, Create, Reschedule, Cancel

### 7.7 Reports

**Metrics:**
- Patients Served (monthly)
- Appointment Statistics
- Diagnosis Statistics
- Prescription Count
- Follow-up Count

**Charts:** Monthly trends, Department trends
**Exports:** PDF, CSV

### 7.8 Settings

- Profile: name, specialty, avatar
- Availability: working hours, leave schedule
- Password change
- Notification preferences
- Theme toggle (light/dark)

### 7.9 Clinical Permission Boundaries

| Action | Doctor |
|---|---|
| Create Diagnoses | ✅ |
| Create SOAP Notes | ✅ |
| Create Prescriptions | ✅ |
| Order Lab / Radiology | ✅ |
| Schedule Follow-ups | ✅ |
| View Patient Records | ✅ |
| View Imaging & Billing | ✅ (read-only) |
| Modify Billing / Payments | ❌ |
| Modify Audit Logs | ❌ |
| Change Patient Registration Info | ❌ |
| Access Hospital / Tenant Settings | ❌ |

---

## 8. Shared Data Models (Entity Reference)

### 8.1 User (Super Admin)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "SUPER_ADMIN";
  tenantId: string | null;
}
```

### 8.2 User (Doctor)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "DOCTOR";
  tenantId: string;
  specialty: string;
  hospitalId: string;
}
```

### 8.3 Tenant
```typescript
interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: string;        // "starter" | "professional" | "enterprise"
  status: string;      // "Active" | "Suspended" | "Trial"
  hospitalCount: number;
  branchCount: number;
  userCount: number;
  storageUsed: number; // GB
  createdAt: string;
}
```

### 8.4 Hospital
```typescript
interface Hospital {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  branchCount: number;
  doctorCount: number;
  patientCount: number;
  bedCount: number;
  status: "Active" | "Inactive" | "Suspended" | "Under Review";
  createdAt: string;
  email?: string;
  phone?: string;
  website?: string;
}
```

### 8.5 Patient (Doctor Portal — Full EMR Record)
```typescript
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bedNumber: string;
  ward: string;
  status: "Active" | "Admitted" | "ICU" | "Follow-up Due";
  allergies: string[];
  medicalHistory: string[];
  assignedDoctorId: string;
  assignedNurse: string;
  assignedCompounder: string;
  shift: string;
  vitals: PatientVitals[];         // { timestamp, bpSystolic, bpDiastolic, temperature, weight, spo2 }
  medications: PatientMedication[];// { id, name, dose, frequency, duration, timing, foodInstructions, status, prescribedBy }
  diagnoses: PatientDiagnosis[];   // { id, code, description, date, status }
  soapNotes: SoapNote[];           // { id, date, author, subjective, objective, assessment, plan }
  timeline: PatientTimelineEvent[];// { id, title, description, date, type }
  billing: PatientBillingSummary[];// { id, invoiceNumber, amount, status, date }
  audits: PatientAuditLog[];       // { id, action, user, timestamp, ipAddress }
  scans: PatientScan[];            // { id, name, type, date, url, report }
}
```

### 8.6 Appointment
```typescript
interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM
  type: "Consultation" | "Follow-up" | "Diagnostic" | "Therapy";
  status: "Scheduled" | "Waiting" | "Completed" | "Cancelled";
  symptoms: string;
  notes?: string;
}
```

### 8.7 Invoice / Billing
```typescript
interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  hospitalId?: string;
  patientId?: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue" | "cancelled" | "draft";
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}
```

### 8.8 Doctor (Clinical/Admin View)
```typescript
interface Doctor {
  id: string;
  name: string;
  email?: string;
  specialization: string;
  hospitalId: string;
  branchId: string;
  departmentId: string;
  experience: number;      // years
  rating: number;          // 0-5
  status: "Active" | "Inactive" | "Suspended" | "On Leave";
  patientsCount: number;
  consultationTime: number; // minutes
  successRate: number;      // percentage
}

// Invitation record (currently in localStorage)
interface DoctorInvitation {
  token: string;       // Base64 encoded { doctorId, name, email }
  doctorId: string;
  name: string;
  email: string;
  used: boolean;
  createdAt: string;
}
```

### 8.9 IAM Entities
```typescript
interface IamUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  tenantId: string;
  hospitalId: string;
  branchId: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  lastLogin: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g. ["users:read", "hospitals:create"]
  status: "Active" | "Inactive";
}

interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  status: "Active" | "Terminated";
}
```

---

## 9. State Management (Zustand Stores)

### Auth Store (both apps)

```typescript
// Persisted to localStorage
// Super Admin key: "hms_super_admin_auth"
// Doctor key:      "hms_doctor_auth"
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantId: string | null;
  role: string | null;
  login(user: User): void;
  logout(): void;
  setUser(user: User | null): void;
  clearUser(): void;
  setIsLoading(v: boolean): void;
}
```

### Sidebar Store
```typescript
interface SidebarState {
  isCollapsed: boolean;
  toggle(): void;
  collapse(): void;
  expand(): void;
}
```

### Theme Store
```typescript
interface ThemeState {
  theme: "light" | "dark" | "system";
  setTheme(theme: string): void;
}
```

---

## 10. Mock Service Layer (Current Implementation)

All services currently simulate async operations and persist to `localStorage`. This is the layer the backend will replace.

### localStorage Keys Used

| Key | Data | Used By |
|---|---|---|
| `hms_super_admin_auth` | Super admin session | Super Admin |
| `hms_doctor_auth` | Doctor session | Doctor Portal |
| `hms_doctor_accounts` | Activated doctor accounts | Doctor Portal |
| `hms_invitations` | Pending doctor invitations | Super Admin + Doctor |
| `hms_patients_registry` | Patient records array | Doctor Portal |

### Service Pattern (Current → Future)
```typescript
// CURRENT (mock)
export const patientsService = {
  async getPatients(doctorId?: string): Promise<Patient[]> {
    await delay(50); // simulates network latency
    const raw = localStorage.getItem('hms_patients_registry');
    return JSON.parse(raw ?? '[]');
  },
  // ... create, update, delete, addSoapNote, addDiagnosis, addPrescription, addLabOrder
};

// FUTURE (real API — only this file changes)
export const patientsService = {
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const params = doctorId ? `?doctorId=${doctorId}` : '';
    const res = await apiClient.get(`/patients${params}`);
    return res.data;
  },
};
```

---

## 11. Backend Integration Guide (Express)

### 11.1 Recommended Architecture

```
Express Backend (Node.js + TypeScript)
├── src/
│   ├── routes/          ← per-resource routers
│   ├── controllers/     ← thin request handlers
│   ├── services/        ← business logic layer
│   ├── models/          ← Prisma schemas (or Mongoose)
│   ├── middleware/
│   │   ├── authenticate.ts    ← verify JWT
│   │   ├── authorize.ts       ← RBAC check
│   │   ├── tenant.ts          ← enforce tenant scoping
│   │   ├── validate.ts        ← Zod request validation
│   │   ├── rateLimit.ts       ← express-rate-limit
│   │   └── auditLog.ts        ← write audit entry
│   ├── utils/           ← errors, response builder, logger
│   └── config/          ← env, db, redis
```

### 11.2 Authentication Strategy (JWT)

```
POST /api/auth/login
  → Validate credentials against DB (bcrypt compare)
  → Issue accessToken: JWT (15 min, RS256 or HS256)
  → Issue refreshToken: opaque UUID (7 days)
  → Store refreshToken hash in DB (refresh_tokens table)
  → Set both as httpOnly Secure cookies (or return in body)

POST /api/auth/refresh
  → Validate refreshToken (not expired, not revoked, hash matches)
  → Issue new accessToken + rotate refreshToken (delete old, insert new)

POST /api/auth/logout
  → Delete refreshToken record from DB (revoke)

GET /api/auth/me
  → Return req.user (populated by authenticate middleware)
```

### 11.3 Multi-Tenancy Enforcement

```typescript
// middleware/tenant.ts
export function enforceTenant(req: Request, res: Response, next: NextFunction) {
  const { role, tenantId } = req.user;
  if (role === 'SUPER_ADMIN') return next(); // no tenant filter for platform admin
  if (!tenantId) return res.status(403).json({ error: 'Tenant required' });
  req.tenantId = tenantId; // inject into all service calls
  next();
}
```

All database queries for non-super-admin users **must** include `WHERE "tenantId" = $tenantId`.

### 11.4 Doctor Invitation Flow (Backend)

```typescript
// 1. Super Admin creates doctor
POST /api/clinical/doctors
→ Insert doctor record (status: "Pending")
→ Generate signed JWT invitation token (expires in 72h)
→ Store hash(token) + doctorId in invitations table
→ Queue email job: send activation link with token

// 2. Doctor activates account
POST /api/auth/activate
body: { token, password }
→ Verify token signature + expiry
→ Find invitation by hash(token) — must be unused
→ Hash password with bcrypt (cost: 12)
→ Create user account (role: DOCTOR, status: Active)
→ Mark invitation.used = true
→ Return 200 (or auto-login with tokens)
```

### 11.5 Replacing Mock Services — Step by Step

1. **Create `packages/api-client/`**:
   ```typescript
   // packages/api-client/src/client.ts
   import axios from 'axios';
   const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
   apiClient.interceptors.request.use(config => {
     const token = getCookie('accessToken');
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });
   apiClient.interceptors.response.use(null, async (error) => {
     if (error.response?.status === 401) {
       await refreshToken(); // call POST /auth/refresh
       return apiClient.request(error.config);
     }
     return Promise.reject(error);
   });
   ```

2. **Replace each `service.ts`** with API calls (same function signatures, different internals).

3. **Keep all TypeScript interfaces** — backend must return data matching the same shape.

4. **Move tokens to httpOnly cookies** — remove `localStorage` token storage for security.

---

## 12. API Endpoint Reference

### Auth

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Auth | Logout |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Reset password |
| POST | `/api/auth/activate` | Public | Activate doctor account |
| GET | `/api/auth/me` | Auth | Current user info |

### Tenants (Super Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants` | List all tenants |
| POST | `/api/tenants` | Create tenant |
| GET | `/api/tenants/:id` | Tenant detail |
| PATCH | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Delete tenant |
| GET | `/api/tenants/:id/subscription` | Subscription info |
| PATCH | `/api/tenants/:id/feature-flags` | Update feature flags |
| GET | `/api/tenants/:id/usage` | Usage quotas |
| GET | `/api/tenants/:id/domains` | Domain config |

### Hospitals

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hospitals` | List hospitals (tenant-scoped) |
| POST | `/api/hospitals` | Create hospital |
| GET | `/api/hospitals/:id` | Hospital detail |
| PATCH | `/api/hospitals/:id` | Update hospital |
| DELETE | `/api/hospitals/:id` | Delete hospital |
| GET | `/api/hospitals/:id/branches` | List branches |
| POST | `/api/hospitals/:id/branches` | Add branch |
| GET | `/api/hospitals/:id/departments` | List departments |
| GET | `/api/hospitals/:id/capacity` | Capacity info |
| GET | `/api/hospitals/:id/accreditation` | Accreditation info |

### Clinical (Super Admin management view)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/clinical/doctors` | List doctors (all hospitals) |
| POST | `/api/clinical/doctors` | Create doctor + send invite |
| GET | `/api/clinical/doctors/:id` | Doctor detail |
| PATCH | `/api/clinical/doctors/:id` | Update doctor |
| DELETE | `/api/clinical/doctors/:id` | Remove doctor |
| GET | `/api/clinical/nurses` | List nurses |
| GET | `/api/clinical/staff` | List staff |
| GET | `/api/clinical/patients` | Patient registry (read) |
| GET | `/api/clinical/appointments` | Appointment records |
| GET | `/api/clinical/admissions` | Admission records |
| GET | `/api/clinical/bed-occupancy` | Bed occupancy stats |
| GET | `/api/clinical/analytics` | Aggregate analytics |

### Patients (Doctor Portal)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patients?doctorId=` | Doctor's patient list |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Patient 360° detail |
| PATCH | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Soft-delete patient |
| POST | `/api/patients/:id/soap-notes` | Add SOAP note |
| GET | `/api/patients/:id/soap-notes` | List SOAP notes |
| POST | `/api/patients/:id/diagnoses` | Add diagnosis |
| GET | `/api/patients/:id/diagnoses` | List diagnoses |
| POST | `/api/patients/:id/prescriptions` | Add prescription |
| GET | `/api/patients/:id/prescriptions` | List prescriptions |
| POST | `/api/patients/:id/lab-orders` | Add lab order |
| GET | `/api/patients/:id/lab-orders` | List lab orders |
| POST | `/api/patients/:id/vitals` | Record vitals |
| GET | `/api/patients/:id/vitals` | Vitals history |
| GET | `/api/patients/:id/timeline` | Patient timeline |
| GET | `/api/patients/:id/billing` | Billing summary (read-only) |
| GET | `/api/patients/:id/audits` | Audit logs (read-only) |

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments?doctorId=&date=` | List appointments |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/:id` | Appointment detail |
| PATCH | `/api/appointments/:id` | Update/reschedule |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment |
| PATCH | `/api/appointments/:id/status` | Update status |

### Billing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/billing/revenue` | Revenue metrics + trends |
| GET | `/api/billing/invoices` | List invoices |
| POST | `/api/billing/invoices` | Create invoice |
| PATCH | `/api/billing/invoices/:id` | Update invoice |
| DELETE | `/api/billing/invoices/:id` | Cancel invoice |
| GET | `/api/billing/payments` | List payments |
| POST | `/api/billing/payments` | Record payment |
| GET | `/api/billing/claims` | List insurance claims |
| POST | `/api/billing/claims` | Submit claim |
| PATCH | `/api/billing/claims/:id` | Update claim status |
| GET | `/api/billing/subscriptions` | Tenant subscriptions |
| GET | `/api/billing/refunds` | Refund list |
| POST | `/api/billing/refunds` | Request refund |

### IAM

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/iam/users` | List users (tenant-scoped) |
| POST | `/api/iam/users` | Create user |
| GET | `/api/iam/users/:id` | User detail |
| PATCH | `/api/iam/users/:id` | Update user |
| DELETE | `/api/iam/users/:id` | Delete user |
| GET | `/api/iam/roles` | List roles |
| POST | `/api/iam/roles` | Create role |
| PATCH | `/api/iam/roles/:id` | Update role |
| GET | `/api/iam/permissions` | Permission matrix |
| GET | `/api/iam/sessions` | Active sessions |
| DELETE | `/api/iam/sessions/:id` | Terminate session |
| GET | `/api/iam/login-history` | Login history |
| GET | `/api/iam/mfa` | MFA settings list |
| PATCH | `/api/iam/mfa/:userId` | Update MFA config |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications (inbox) |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| GET | `/api/notifications/templates` | List templates |
| POST | `/api/notifications/templates` | Create template |
| PATCH | `/api/notifications/templates/:id` | Update template |
| GET | `/api/notifications/broadcasts` | List broadcasts |
| POST | `/api/notifications/broadcasts` | Create + send broadcast |
| GET | `/api/notifications/delivery-logs` | Delivery logs |
| GET | `/api/notifications/analytics` | Channel analytics |

### Monitoring (Super Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/monitoring/stats` | Dashboard KPIs |
| GET | `/api/monitoring/services` | Service health |
| GET | `/api/monitoring/api-health` | API endpoint metrics |
| GET | `/api/monitoring/databases` | Database health |
| GET | `/api/monitoring/queues` | Queue depths |
| GET | `/api/monitoring/jobs` | Job records |
| GET | `/api/monitoring/storage` | Storage metrics |
| GET | `/api/monitoring/errors` | Error logs |
| GET | `/api/monitoring/uptime` | Uptime history |

### Audit

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit/logs` | All audit logs |
| GET | `/api/audit/security-events` | Security events |
| GET | `/api/audit/data-access` | PHI data access records |
| GET | `/api/audit/access-history` | Login/logout history |
| GET | `/api/audit/compliance-stats` | HIPAA compliance summary |

### Integrations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/integrations` | All integrations |
| GET | `/api/integrations/payment-gateways` | Payment gateways |
| POST | `/api/integrations/payment-gateways` | Add gateway |
| GET | `/api/integrations/insurance-providers` | Insurance providers |
| GET | `/api/integrations/hl7-fhir` | HL7/FHIR configs |
| GET | `/api/integrations/email-providers` | Email providers |
| GET | `/api/integrations/sms-providers` | SMS providers |
| GET | `/api/integrations/whatsapp-providers` | WhatsApp providers |
| GET | `/api/integrations/storage` | Storage providers |
| GET | `/api/integrations/webhooks` | Webhook configs |
| POST | `/api/integrations/webhooks` | Create webhook |
| GET | `/api/integrations/api-keys` | API keys |
| POST | `/api/integrations/api-keys` | Generate API key |

---

## 13. Database Schema Recommendations

### Recommended Stack
- **Primary DB**: PostgreSQL (via Prisma ORM)
- **Cache / Session store**: Redis
- **File Storage**: AWS S3 or Cloudinary
- **Background Jobs**: BullMQ (Redis-backed)
- **Search** (optional): PostgreSQL full-text or Meilisearch

### Core Tables

```sql
-- Multi-tenancy root
tenants (
  id UUID PK, name, code UNIQUE, plan, status,
  storage_used_gb DECIMAL, created_at TIMESTAMPTZ
)
tenant_subscriptions (
  id UUID PK, tenant_id FK, plan_name, billing_cycle,
  amount DECIMAL, currency, status, start_date, end_date, next_billing_date
)
tenant_feature_flags (
  tenant_id FK UNIQUE, emr BOOL, appointments BOOL,
  billing BOOL, pharmacy BOOL, inventory BOOL, laboratory BOOL,
  radiology BOOL, insurance BOOL, telemedicine BOOL,
  notifications BOOL, reports BOOL
)
tenant_domains (
  id UUID PK, tenant_id FK, primary_domain, custom_domain,
  ssl_enabled BOOL, verified BOOL
)
tenant_usage_quotas (
  tenant_id FK, hospitals_current INT, hospitals_max INT,
  branches_current INT, branches_max INT, doctors_current INT,
  doctors_max INT, staff_current INT, staff_max INT,
  patients_current INT, patients_max INT,
  storage_current_gb DECIMAL, storage_max_gb DECIMAL,
  api_calls_current INT, api_calls_max INT
)

-- Organization hierarchy
hospitals (
  id UUID PK, tenant_id FK, name, code, type, status,
  branch_count INT, doctor_count INT, patient_count INT, bed_count INT,
  email, phone, website, description, logo_url, created_at
)
branches (
  id UUID PK, hospital_id FK, name, code, city, status,
  doctor_count INT, patient_count INT, department_count INT
)
departments (
  id UUID PK, branch_id FK, name, doctor_count INT,
  patient_count INT, status, created_at
)
hospital_capacity (
  hospital_id FK UNIQUE, total_beds INT, available_beds INT,
  occupied_beds INT, icu_beds INT, ot_rooms INT,
  ambulances INT, emergency_units INT,
  pharmacy_available BOOL, laboratory_available BOOL, blood_bank_available BOOL
)
hospital_accreditation (
  hospital_id FK UNIQUE, nabh, jci, iso,
  license_number, expiry_date
)

-- Users & Auth
users (
  id UUID PK, tenant_id FK, hospital_id FK, branch_id FK,
  department_id FK, email UNIQUE, password_hash, role,
  status, first_name, last_name, phone, avatar_url,
  last_login, created_at
)
roles (id UUID PK, name UNIQUE, description, status)
permissions (id UUID PK, key UNIQUE, description)
role_permissions (role_id FK, permission_id FK, PRIMARY KEY(role_id, permission_id))
user_roles (user_id FK, role_id FK, PRIMARY KEY(user_id, role_id))
refresh_tokens (
  id UUID PK, user_id FK, token_hash UNIQUE,
  expires_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ, created_at
)
invitations (
  id UUID PK, doctor_id FK, email, token_hash UNIQUE,
  used BOOL DEFAULT false, expires_at TIMESTAMPTZ, created_at
)
mfa_settings (
  user_id FK UNIQUE, enabled BOOL, method,
  secret_encrypted TEXT, updated_at
)
sessions (
  id UUID PK, user_id FK, device, browser, os, ip_address,
  country, login_time, last_activity, status
)
login_history (
  id UUID PK, user_id FK, email, device, browser,
  ip_address, country, login_time, status
)

-- Clinical
doctors (
  id UUID PK, user_id FK UNIQUE, tenant_id FK, hospital_id FK,
  branch_id FK, department_id FK, specialization,
  experience_years INT, rating DECIMAL, status,
  patients_count INT, consultation_time_min INT, success_rate DECIMAL
)
patients (
  id UUID PK, tenant_id FK, hospital_id FK, doctor_id FK,
  name, age INT, gender, bed_number, ward, status,
  allergies TEXT[], medical_history TEXT[],
  assigned_nurse, assigned_compounder, shift,
  created_at, updated_at, deleted_at  -- soft delete
)
vitals (
  id UUID PK, patient_id FK, bp_systolic INT, bp_diastolic INT,
  temperature DECIMAL, weight DECIMAL, spo2 INT,
  recorded_by FK(users), recorded_at TIMESTAMPTZ
)
diagnoses (
  id UUID PK, patient_id FK, code, description,
  status, date DATE, added_by FK(users)
)
medications (
  id UUID PK, patient_id FK, name, dose, frequency,
  duration, timing, food_instructions, status,
  prescribed_by TEXT, administered_by TEXT, administered_date,
  created_at
)
soap_notes (
  id UUID PK, patient_id FK, author FK(users),
  subjective TEXT, objective TEXT, assessment TEXT,
  plan TEXT, created_at
)
lab_orders (
  id UUID PK, patient_id FK, name, type, status,
  ordered_by FK(users), report TEXT, ordered_at, result_url
)
patient_timeline (
  id UUID PK, patient_id FK, title, description,
  event_type, event_date TIMESTAMPTZ
)
patient_audits (
  id UUID PK, patient_id FK, action, user_id FK,
  ip_address, created_at TIMESTAMPTZ
)
appointments (
  id UUID PK, patient_id FK, doctor_id FK, hospital_id FK,
  date DATE, time TIME, type, status,
  symptoms TEXT, notes TEXT, created_at
)
admissions (
  id UUID PK, patient_id FK, hospital_id FK, type,
  status, admission_date, discharge_date
)

-- Billing
invoices (
  id UUID PK, tenant_id FK, hospital_id FK, patient_id FK,
  amount DECIMAL, currency, status, issued_date,
  due_date, paid_date, created_at
)
invoice_items (
  id UUID PK, invoice_id FK, description,
  quantity INT, unit_price DECIMAL, total DECIMAL
)
payments (
  id UUID PK, invoice_id FK, tenant_id FK, amount DECIMAL,
  currency, method, status, payment_date, reference_id
)
insurance_claims (
  id UUID PK, invoice_id FK, patient_id FK, provider_name,
  insurance_company, policy_number, amount_claimed DECIMAL,
  amount_approved DECIMAL, currency, status,
  submission_date, processing_date, denial_reason
)
refunds (
  id UUID PK, payment_id FK, invoice_id FK, tenant_id FK,
  amount DECIMAL, currency, reason TEXT, status,
  request_date, processed_date
)

-- Notifications
notification_templates (
  id UUID PK, name, channel, category, subject,
  body TEXT, variables TEXT[], status, created_at, updated_at
)
broadcasts (
  id UUID PK, title, description, channel, audience,
  message TEXT, status, priority, scheduled_at,
  sent_at, recipient_count INT
)
delivery_logs (
  id UUID PK, notification_id, recipient, recipient_email,
  channel, status, delivered_at, read_at, retries INT, error_message
)

-- Integrations
integrations (
  id UUID PK, tenant_id FK, name, type, provider,
  status, environment, webhook_enabled BOOL,
  api_calls_today INT, created_at, updated_at
)
webhooks (
  id UUID PK, tenant_id FK, event, url, method,
  status, retry_count INT, last_triggered, secret_hash
)
api_keys (
  id UUID PK, tenant_id FK, service, environment,
  key_hash UNIQUE, status, last_used, created_at
)

-- Audit (append-only, never DELETE)
audit_logs (
  id UUID PK, tenant_id FK, module, action, entity,
  user_id FK, severity, status, created_at TIMESTAMPTZ
)
security_events (
  id UUID PK, tenant_id FK, type, severity,
  user_id FK, ip_address, status, created_at
)
data_access_logs (
  id UUID PK, tenant_id FK, module, entity, action,
  user_id FK, reason TEXT, created_at
)
```

---

## 14. Security & Production Checklist

### Authentication
- [ ] Passwords hashed with `bcrypt` (cost factor ≥ 12)
- [ ] JWT signed with RS256 (asymmetric) — public key for verification, private key for signing
- [ ] Access token TTL: 15 minutes
- [ ] Refresh token: stored as `SHA-256(token)` hash in DB, rotated on every use
- [ ] Tokens delivered via `httpOnly; Secure; SameSite=Strict` cookies (not localStorage)
- [ ] CSRF protection: `SameSite=Strict` cookie policy or CSRF token header

### Authorization
- [ ] Every protected endpoint has `authenticate` + `authorize(role)` middleware
- [ ] Every non-super-admin query scoped with `WHERE tenant_id = $tenantId`
- [ ] Doctor endpoints: block billing mutations, audit log mutations
- [ ] Super Admin endpoints: require `role === 'SUPER_ADMIN'` check

### Rate Limiting
- [ ] `/api/auth/login`: 5 attempts / 15 min / IP
- [ ] `/api/auth/forgot-password`: 3 / hour / email
- [ ] General API: 100 req/min / user token
- [ ] Invitation generation: 10 / hour / admin

### Data Validation
- [ ] All request bodies validated with Zod (or Joi) before reaching controllers
- [ ] File uploads: validate MIME type, max file size, malware scan (ClamAV or cloud service)
- [ ] SQL injection prevented via Prisma parameterized queries (never raw string interpolation)
- [ ] XSS: sanitize user-supplied HTML before storage and output

### HIPAA Compliance
- [ ] All patient record access logged to `data_access_logs` (who, what, when, why)
- [ ] PHI fields encrypted at rest (AES-256-GCM) or full disk encryption
- [ ] Data export events logged in `audit_logs`
- [ ] Audit tables: append-only, no UPDATE/DELETE permissions granted to app user
- [ ] Patient data deletion: soft-delete only (`deleted_at`), hard delete requires admin + compliance review
- [ ] TLS 1.2+ enforced for all connections

### Infrastructure
- [ ] HTTPS enforced (HTTP → HTTPS redirect)
- [ ] Helmet.js: `Content-Security-Policy`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`
- [ ] Environment variables: `.env` local, secrets manager in production (AWS Secrets Manager / HashiCorp Vault)
- [ ] Database: connection pooling via PgBouncer
- [ ] Redis: TLS-enabled, password-protected, separate DB indices per concern
- [ ] Read replicas for reporting/analytics queries (avoid hitting primary)
- [ ] Automated daily backups + point-in-time recovery for PostgreSQL
- [ ] Structured JSON logging (Winston → CloudWatch / Datadog / Loki)
- [ ] Error monitoring: Sentry (capture exceptions with request context)
- [ ] Health endpoint: `GET /health` returns DB, Redis, queue status

### Frontend → Backend Migration Steps

1. **Build `packages/api-client/`** with Axios instance, interceptors, token refresh logic
2. **Replace each `service.ts`** localStorage implementation with the corresponding REST call
3. **Keep all TypeScript interfaces** — backend response shape must match existing frontend types
4. **Auth state**: switch from Zustand persist (localStorage) to httpOnly cookie tokens; store only non-sensitive user metadata in Zustand
5. **Error handling**: standardize API error responses → `{ error: string, code: string, statusCode: number }`
6. **Test each feature module** independently after its service is migrated
7. **Remove all `localStorage` keys** once backend is live and verified

---

*This document was generated from a full codebase analysis of the `hms-monorepo` (apps/super-admin + apps/doctor-portal).*  
*Last updated: June 2026*

