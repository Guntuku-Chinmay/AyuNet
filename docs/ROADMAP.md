# AyuNet Product Roadmap

This document outlines the milestones and implementation phases for the AyuNet platform.

---

## 🗺️ Phases of Implementation

### 🏁 Phase 1: Project Foundation (Current)
*Objective: Set up the workspace structure, shared libraries, and local development configurations.*
- [x] Yarn workspaces monorepo structure.
- [x] Base linting, formatting, and editor guidelines.
- [x] Shared TypeScript definitions package (`@ayunet/types`).
- [x] Shared utilities and classes package (`@ayunet/utils`).
- [x] Shared Tailwind UI component package (`@ayunet/ui`).
- [x] Scaffold frontends (`patient-web`, `doctor-web`, `admin-web`).
- [x] Scaffold NestJS backend with Prisma configuration.
- [x] Local docker-compose configuration (PostgreSQL & dev services).
- [x] CI workflows and Git hooks.

---

### 🏥 Phase 2: Core Patient & Doctor Services
*Objective: Build user entities, authentication boundaries, and primary clinical consult flows.*
- [ ] **Authentication & Identity**: OAuth2, multi-tenant RBAC (Patients, Doctors, Admins, Pharmacists).
- [ ] **Patient Profile Module**: Demographic files, emergency contacts, vitals tracking.
- [ ] **Doctor Directory & Profiles**: Specialty classifications, credentials, consultation schedules.
- [ ] **Appointment Engine**: Booking, calendar views, slots reservation, video consultation integration (WebRTC).

---

### 💊 Phase 3: Pharmacy, E-Prescriptions, & Diagnostics
*Objective: Connect diagnostics pipelines, pharmacy dispatch channels, and EMR integration.*
- [ ] **Electronic Health Records (EMR)**: Structured medical notes, diagnosis tagging (ICD-10).
- [ ] **e-Prescription Module**: Standardised prescription signatures and direct transmission to pharmacies.
- [ ] **Diagnostic Center Integrations**: Lab test orders, pathology reporting, radiological image file storage (PACS/DICOM).
- [ ] **Pharmacy Dispatch**: Orders fulfillment tracking and home-delivery scheduling.

---

### 📊 Phase 4: Operational Analytics, Payments, & AI
*Objective: Implement operational monitoring dashboards, pay gateways, and diagnostic assistance bots.*
- [ ] **Payment Gateways**: Stripe/Razorpay integrations, billing ledgers, and insurance claims.
- [ ] **Admin Operations Dashboard**: Platform usage metrics, active doctor lists, system load, revenue monitoring.
- [ ] **AI-Assisted Operations**: Automated symptom checkers, EHR summarization, and diagnostic suggestions.
