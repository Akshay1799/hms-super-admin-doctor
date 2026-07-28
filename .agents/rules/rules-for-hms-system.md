---
trigger: always_on
---

# HMS Enterprise Business Consistency & Cross-System Integrity Rules

## Purpose

You are building an **enterprise-grade, multi-tenant Hospital Management System**.

Your responsibility extends beyond implementing individual features. Every new feature, API, workflow, or UI change must preserve consistency across the entire system.

Never think only about the module currently being modified. Always consider its impact on every related module, user role, workflow, notification, dashboard, report, audit log, and business process.

The goal is to maintain a single, consistent source of truth across the entire HMS.

---

# 1. Think System-Wide Before Coding

Before implementing any feature:

Analyze:

* Which modules are affected?
* Which user roles are affected?
* Which dashboards should change?
* Which reports should update?
* Which notifications should be triggered?
* Which audit logs should be created?
* Which permissions are required?
* Which APIs must remain consistent?
* Which data must stay synchronized?
* Which domain events should be published?

Never implement a feature in isolation.

---

# 2. Data Synchronization Rules

Whenever data changes in one module, determine whether the same information should be reflected elsewhere.

Examples include:

* Patient profile updates
* Doctor profile updates
* Appointment status
* Admission status
* Bed allocation
* Billing status
* Invoice payment
* Lab results
* Radiology reports
* Pharmacy inventory
* Prescription status
* Employee information
* Department information

Never leave duplicated business data inconsistent across the system.

Use existing synchronization mechanisms, shared services, or domain events rather than manual duplication.

---

# 3. Single Source of Truth

Every business entity must have one owning module.

Examples:

* Patient → Patient Module
* Doctor → Doctor Module
* Appointment → Appointment Module
* Invoice → Billing Module
* Medicine → Pharmacy Module
* Inventory Item → Inventory Module

Other modules may reference this data but must not become alternative sources of truth.

---

# 4. Dashboard Responsibility

Every authenticated user must have access **only** to the dashboard assigned to their role.

Users must never access dashboards belonging to other roles unless explicitly authorized by the business requirements.

Examples:

* Super Admin → Super Admin Dashboard
* Tenant Admin → Tenant Dashboard
* Hospital Admin → Hospital Dashboard
* Department Admin → Department Dashboard
* Doctor → Doctor Dashboard
* Receptionist → Reception Dashboard
* Nurse → Nursing Dashboard
* Lab Technician → Laboratory Dashboard
* Radiologist → Radiology Dashboard
* Pharmacist → Pharmacy Dashboard
* Patient → Patient Portal

Role separation must be enforced on both the backend and frontend.

---

# 5. Dashboard Content

Each dashboard should display only information relevant to that role.

Never overload dashboards with unnecessary data.

Examples:

Doctor Dashboard:

* Today's appointments
* Assigned patients
* Pending consultations
* Recent prescriptions
* Lab reports requiring review

Do not display:

* Hospital revenue
* Employee salaries
* Inventory purchasing
* HR information
* Tenant settings

Every dashboard should be optimized for the user's daily workflow.

---

# 6. Permission Enforcement

Permissions must never rely solely on the frontend.

Every API must verify:

* Authentication
* Role
* Permissions
* Tenant ownership
* Hospital ownership
* Department ownership (where applicable)

UI restrictions are for user experience; backend validation is mandatory.

---

# 7. Multi-Tenant Isolation

No tenant may access another tenant's data.

No hospital may access another hospital's data.

No department may access another department's restricted information unless explicitly permitted.

All queries, APIs, reports, exports, dashboards, and searches must respect tenant boundaries.

---

# 8. Business Workflow Integrity

Every workflow must remain complete from start to finish.

For example, booking an appointment may require updates to:

* Appointment schedule
* Doctor availability
* Patient timeline
* Notification queue
* Audit logs
* Dashboard widgets
* Analytics
* Calendar views

The implementation should account for the full workflow, not just the initial database update.

---

# 9. Cross-Module Impact Analysis

Before implementing any change, identify whether it affects:

* Appointments
* Patients
* Doctors
* Billing
* Pharmacy
* Laboratory
* Radiology
* Inventory
* IPD
* Emergency
* Blood Bank
* Nursing
* Notifications
* CRM
* Reporting
* Analytics
* Search
* Audit
* AI
* Mobile App
* Patient Portal

If additional modules are affected, include them in the implementation plan.

---

# 10. UI Consistency

Maintain a consistent user experience across all applications.

Reuse existing:

* Layouts
* Components
* Forms
* Tables
* Dialogs
* Status indicators
* Colors
* Icons
* Validation messages
* Error handling
* Loading states

Avoid introducing inconsistent UI patterns.

---

# 11. Status Consistency

Business statuses must remain synchronized throughout the platform.

Examples:

Appointment:

* Scheduled
* Confirmed
* Checked-In
* In Progress
* Completed
* Cancelled
* No Show

The same status should be represented consistently across dashboards, APIs, notifications, reports, and mobile applications.

---

# 12. Reporting Consistency

Whenever business data changes, evaluate whether reports, analytics, or dashboards should reflect the update.

Reports should derive information from authoritative business data rather than duplicated calculations.

---

# 13. Audit Trail

Every significant business action should generate an audit record where appropriate.

Include:

* Actor
* Timestamp
* Entity
* Previous value (when applicable)
* New value
* Reason (if provided)

Audit records must be immutable.

---

# 14. Notification Consistency

Whenever a business event occurs, determine whether notifications are required.

Examples:

* Appointment booked
* Appointment cancelled
* Lab report ready
* Invoice generated
* Payment received
* Admission approved
* Discharge completed

Notifications should originate from business events rather than scattered controller logic.

---

# 15. Existing Functionality

Before implementing a new feature:

Search for:

* Existing APIs
* Existing components
* Existing services
* Existing hooks
* Existing utilities
* Existing domain logic

Extend existing functionality whenever possible instead of creating duplicates.

---

# 16. Before Completing Any Task

Verify:

* Is every affected module updated?
* Are dashboards synchronized?
* Are permissions correct?
* Are notifications handled?
* Are audit logs created?
* Are reports still correct?
* Is the UI consistent?
* Is tenant isolation preserved?
* Is existing functionality unaffected?
* Does the implementation maintain a single source of truth?

If any answer is "No" or "Unknown," stop and resolve it before considering the task complete.

---

## Final Principle

**Build the HMS as one integrated enterprise platform—not as a collection of independent modules.**

Every feature should feel like a natural extension of the entire system. Whenever one part of the platform changes, proactively consider its impact on related modules, user roles, dashboards, workflows, reports, permissions, notifications, and data integrity. The objective is to deliver a cohesive, secure, and maintainable system where every component works together seamlessly and consistently.
