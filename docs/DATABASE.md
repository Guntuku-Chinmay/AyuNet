# AyuNet Database Architecture

This document describes the database design principles, migration workflows, and database entities planned for AyuNet.

---

## 🗄️ Database Technology Stack

- **Engine**: PostgreSQL 16
- **Object-Relational Mapping (ORM)**: Prisma
- **Host**: Configured via Docker Compose for local environments.

---

## 📂 Database Migration Workflow

When modifying the database schema (`backend/prisma/schema.prisma`):

1. **Format the Prisma schema file**:
   ```bash
   yarn workspace backend prisma format
   ```

2. **Create and apply a migration**:
   ```bash
   yarn workspace backend prisma migrate dev --name <migration_description>
   ```

3. **Verify the generated client**:
   The migration command will automatically invoke `prisma generate` which updates the typescript declarations inside `node_modules/.prisma/client`.

---

## 🗺️ Outlined Entity Tables (Placeholders)

Below is the database architecture plan for upcoming phases.

### 1. Identity & Profiles
- **`User`**: Main authorization table. Stores email, hash password, roles (PATIENT, DOCTOR, ADMIN), and active status.
- **`PatientProfile`**: Linked 1-to-1 with `User`. Stores demographic file data, blood group, emergency contact details.
- **`DoctorProfile`**: Linked 1-to-1 with `User`. Stores licenses, specialties, hospital associations, consulting fees.

### 2. Clinical Operations
- **`Appointment`**: Connects a `PatientProfile` and a `DoctorProfile`. Tracks scheduling slots, consult status (PENDING, ACTIVE, COMPLETED, CANCELLED), and teleconsult links.
- **`MedicalRecord`**: EMR ledger entry containing diagnosis codes (ICD-10), symptoms, lab findings, and physician notes. Linked to `PatientProfile` and `DoctorProfile`.
- **`Prescription`**: Linked to `MedicalRecord`. Stores medications, dosages, instruction strings, and signature logs.

### 3. Supply Chain & Diagnostics
- **`DiagnosticOrder`**: Holds lab investigations requested by a doctor. Connects `PatientProfile`, `DoctorProfile`, and partner lab center.
- **`PharmacyOrder`**: Linked to a `Prescription`. Manages delivery addresses, tracking states (DISPATCHED, DELIVERED), and invoice lines.
