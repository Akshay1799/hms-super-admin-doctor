# Doctor Portal Frontend Engineering Specification (PRD v1.0)

# Final Implementation Plan

This implementation plan defines the safest and most scalable approach for migrating the existing HMS frontend to a monorepo and building the Doctor Portal while preserving the architecture and standards established by Super Admin PRD v2.0.

---

# CORE DIRECTIVES

## Stack Consistency

Preserve exact versions from Super Admin.

Use:

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI
* TanStack Query
* Zustand
* React Hook Form
* Zod

Never upgrade dependencies during migration.

Migration should only change folder structure.

---

## Architecture Principle

Always follow:

```text
Component
↓
Hook
↓
Service
↓
Mock Data
↓
Future API
```

Never fetch directly inside components.

---

## Code Reuse Principle

No premature extraction into packages.

Extract components only when multiple applications genuinely need them.

Avoid duplication.

Do not duplicate AppShell logic.

---

## Incremental Delivery Principle

Large modules should be implemented gradually.

Especially:

```text
Patient 360°
```

Never attempt to build the entire Patient 360 module in one pass.

---

# PHASE 0 — REPOSITORY MIGRATION

Goal:

Safely convert the current repository into a workspace-based monorepo without affecting the existing Super Admin application.

---

## Execution Order

### Step 1

Move current application:

```text
root
↓
apps/super-admin
```

---

### Step 2

Configure npm workspaces

Root package.json:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

---

### Step 3

Create package skeletons

```text
packages/

ui/
hooks/
schemas/
types/
constants/
api-client/
```

These packages remain empty initially.

No component extraction yet.

---

### Step 4

Verify Super Admin

Ensure:

* Build succeeds
* No broken imports
* No dependency upgrades
* Existing functionality remains unchanged

---

### Step 5

Create:

```text
apps/doctor-portal
```

Folder structure:

```text
src/

app/
features/
components/
hooks/
services/
store/
schemas/
types/
mocks/
constants/
providers/
utils/
lib/
config/
assets/
styles/
```

---

# PHASE 1 — ARCHITECTURE + AUTHENTICATION

---

## Doctor Portal Architecture

Initialize:

```text
apps/doctor-portal
```

using:

* Next.js 15
* TypeScript
* Tailwind
* Shadcn UI

Reuse:

* Theme
* globals.css
* Design system

from Super Admin.

---

## Authentication

Routes

```text
/login

/activate-account

/forgot-password

/reset-password
```

---

## Authentication Flow

```text
Hospital Admin
↓
Create Doctor
↓
Invitation Email
↓
Activate Account
↓
Doctor Login
↓
Dashboard
```

No self-signup.

---

# PHASE 2 — APP SHELL + DASHBOARD

---

## App Shell

Contains:

* Sidebar
* Header
* Notifications
* Command Menu
* Breadcrumbs
* Theme Toggle

Rule:

Extract shared layout components only when required.

---

# Dashboard

Widgets

### Today's Appointments

### Waiting Patients

### Critical Patients

### Follow-ups

### Recent Prescriptions

### Notifications

### Upcoming Appointments ⭐

### Recently Viewed Patients ⭐

### Critical Alerts ⭐

Examples:

```text
⚠ Penicillin Allergy

⚠ Critical Lab Value

⚠ Follow-up Due
```

---

## Charts

Appointments Trend

Patients Trend

---

## Quick Actions

Open Patient

Create Prescription

Schedule Follow-up

---

# PHASE 3 — PATIENT MANAGEMENT

---

# My Patients

Route

```text
/my-patients
```

Supports:

* Table View
* Card View
* Search
* Filters
* Risk Indicators

States:

```text
Active

Admitted

ICU

Follow-up Due
```

---

# Patient 360°

Route

```text
/my-patients/:id
```

Largest module.

Implemented incrementally.

---

## STEP A — Core Profile

### Overview

### Vitals

Supports trend charts:

* BP
* Temperature
* Weight
* SpO₂

### Allergies

Risk Banner:

```text
⚠ Penicillin Allergy

⚠ Diabetes

⚠ Hypertension
```

### Medical History

---

## STEP B — Care & History

### Current Medications

### Medication History

### Injection History

### Assigned Nurse & Compounder

Includes:

* Nurse
* Compounder
* Shift
* Ward
* Bed Number

### Medication Administration History

Displays:

* Prescribed By
* Administered By
* Date
* Time
* Missed Doses
* Discontinued Medications

---

## STEP C — Additional Sections

### Timeline

### Billing Summary

(Read Only)

### Audit Logs

(Read Only)

---

# PHASE 3.5 — CLINICAL DOCUMENTATION

Separate implementation stage.

---

## Diagnoses

---

## SOAP Notes

---

## Progress Notes

---

## Follow-ups

---

## Lab Orders

---

## Lab Results

Supports trend charts:

* HbA1c
* Creatinine
* Hemoglobin

---

## Radiology Orders

---

## Radiology Reports

---

## Imaging Viewer

Read Only

Download Supported

Supports:

* X-Ray
* CT
* MRI
* ECG
* Ultrasound

---

## Documents

---

## Admissions

---

## Discharge Summaries

---

## Procedures ⭐

Read-only history

Includes:

* Surgery
* Dialysis
* Endoscopy
* Biopsy
* Catheterization

---

# PHASE 4 — APPOINTMENTS + PRESCRIPTIONS

---

# Appointments

Route

```text
/appointments
```

Views

* Day
* Week
* Month

Actions

* View
* Create
* Reschedule
* Cancel

Statuses

```text
Scheduled

Waiting

Completed

Cancelled
```

---

# Prescriptions

Medicines

Supports:

* Name
* Dose
* Frequency
* Duration
* Timing
* Food Instructions

---

## Injections

Supports:

* Name
* Route
* Dose

---

## IV Fluids

---

## Printable PDF

---

## Digital Signature

---

## History

Current

Past

Discontinued

---

# PHASE 5 — REPORTS + SETTINGS

---

# Reports

Keep simple.

Metrics:

* Patients Served
* Appointment Statistics
* Diagnosis Statistics
* Prescription Count
* Follow-up Count

Charts:

* Monthly Trends
* Department Trends

Exports:

* PDF
* CSV

---

# Settings

Supports:

## Profile

## Availability

## Working Hours

## Password

## Notification Preferences

## Theme

---

# Appendix

Finalize:

* Route Map
* Folder Structure
* Query Key Registry
* Component Catalog
* Shared Components

---

# CLINICAL DATA RESTRICTIONS ⭐

Doctor Portal is not an administration panel.

---

## Doctors CAN create:

* Diagnoses
* SOAP Notes
* Progress Notes
* Prescriptions
* Lab Orders
* Radiology Orders
* Follow-ups

---

## Doctors CAN view:

* Patient Records
* Imaging
* Billing Summary
* Admissions
* Documents
* Procedures

---

## Doctors CANNOT modify:

* Billing
* Payments
* Claims
* Audit Logs
* Patient Registration Information
* Hospital Settings
* Tenant Settings
* System Configuration

---

# FINAL EXECUTION ORDER

```text
Phase 0
↓
Phase 1
↓
Phase 2
↓
Phase 3
↓
Phase 3.5
↓
Phase 4
↓
Phase 5
```

---

# Final Verdict

This implementation plan fully aligns with:

* ✅ Super Admin PRD v2.0
* ✅ Multi-tenant SaaS architecture
* ✅ Mock-data-first approach
* ✅ Future API integration
* ✅ Future Nurse Portal
* ✅ Future Staff Portal
* ✅ Future Patient Portal
* ✅ Enterprise-grade scalability

This is the implementation plan I would approve before starting development.
