# AyuNet - Digital Healthcare Ecosystem

AyuNet is a scalable, enterprise-grade digital healthcare platform connecting Patients, Doctors, Hospitals, Pharmacies, Diagnostic Centers, Caregivers, and System Administrators.

This project is structured as a TypeScript monorepo using **Yarn Workspaces**, separating frontends, backend, and shared libraries.

---

## 🛠️ Technology Stack

- **Patient, Doctor, & Admin Portals**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend API Service**: NestJS (TypeScript), Prisma ORM, PostgreSQL.
- **Infrastructure & Development**: Docker, Docker Compose, ESLint, Prettier, Husky, lint-staged, GitHub Actions.

---

## 📂 Project Structure

```text
AyuNet/
├── .github/                  # GitHub Actions CI workflow config
├── .husky/                   # Git Hook setup scripts (pre-commit)
├── apps/
│   ├── patient-web/          # Next.js patient portal
│   ├── doctor-web/           # Next.js clinician portal
│   └── admin-web/            # Next.js operations portal
├── backend/                  # NestJS Core API (with Prisma ORM configuration)
├── packages/
│   ├── ui/                   # Shared Tailwind components library
│   ├── types/                # Shared TypeScript models and interfaces
│   └── utils/                # Shared utility functions (e.g., cn helper)
├── docs/                     # Platform design and operations documentation
├── infra/
│   └── docker/               # App and service Dockerfiles
├── docker-compose.yml        # Multi-container orchestration config
├── package.json              # Monorepo workspaces definition
└── tsconfig.json             # Shared strict typescript guidelines
```

---

## 📘 Platform Documentation

Detailed documentation for different modules and governance guidelines can be found under the [docs](./docs) directory:

1. 🏛️ **[System Architecture (ARCHITECTURE.md)](./docs/ARCHITECTURE.md)** - High-level system design, frontend-backend flow, and shared packages boundaries.
2. 🗺️ **[Product Roadmap (ROADMAP.md)](./docs/ROADMAP.md)** - Implementation phases, business module goals, and milestones.
3. 🗄️ **[Database Architecture (DATABASE.md)](./docs/DATABASE.md)** - Schema guidelines, entity relationships, and migrations workflow.
4. 🔌 **[API Development Guidelines (API_GUIDELINES.md)](./docs/API_GUIDELINES.md)** - HTTP protocols, response packaging, naming standards, and API structure.
5. 🤝 **[Developer Contribution Guide (CONTRIBUTING.md)](./docs/CONTRIBUTING.md)** - Workspace setup instructions, coding rules, linting, and branch workflows.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed locally:
- [Node.js](https://nodejs.org/) v20 or later
- [Yarn](https://classic.yarnpkg.com/lang/en/) v1.22.x
- [Docker & Docker Compose](https://www.docker.com/) (optional, for PostgreSQL containerization)

### Initial Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Guntuku-Chinmay/AyuNet.git
   cd AyuNet
   ```

2. Copy the environment template file:
   ```bash
   cp .env.example .env
   ```

3. Install all workspace dependencies (this will link packages automatically):
   ```bash
   yarn.cmd install
   ```

4. Initialize the Prisma Client (generated locally for typing):
   ```bash
   yarn workspace backend prisma:generate
   ```

### Running Locally

To run the platform services during development:

- **Start all frontends and backend concurrently**:
  ```bash
  # Spin up PostgreSQL first
  docker compose up -d database
  
  # Run all in development mode
  yarn dev:patient    # Runs Patient Web at http://localhost:3000
  yarn dev:doctor     # Runs Doctor Web at http://localhost:3001
  yarn dev:admin      # Runs Admin Web at http://localhost:3002
  yarn dev:backend    # Runs NestJS API at http://localhost:4000
  ```

---

## 🧪 Formatting and Linting

We enforce strict linting rules and code style format checking:

- **Run ESLint checks across workspaces**:
  ```bash
  yarn lint
  ```

- **Run Prettier checks**:
  ```bash
  yarn format:check
  ```

- **Format all code**:
  ```bash
  yarn format
  ```
