# AyuNet Developer Contribution Guide

Welcome to the AyuNet codebase! To maintain quality, consistency, and stability, all contributors must adhere to the following workflow guidelines.

---

## 💻 Local Setup & Rules

Ensure you have run `yarn.cmd install` from the root directory to download package dependencies and configure project workspace links.

### 1. Editor Configuration
We use `.editorconfig` to enforce tab sizing and character formats. Install the **EditorConfig** plugin in your IDE (e.g. VS Code, WebStorm) if it is not supported natively.

### 2. Linting & Formatting
Before staging and committing files, ensure your code conforms to the configurations:
- **Lint**: Run `yarn lint` to check rules.
- **Format**: Run `yarn format` to write Prettier changes.
- **Strict TypeScript**: Never bypass strict compiler constraints. Avoid using `any` types; define schemas or declare properties inside `@ayunet/types`.

---

## 🌿 Branch Naming Guidelines

Format branch names as follows:
- `feature/name-of-feature` (e.g. `feature/patient-signup`)
- `bugfix/issue-description` (e.g. `bugfix/appointment-overlap`)
- `hotfix/urgent-patch` (e.g. `hotfix/payment-crash`)
- `chore/tool-config` (e.g. `chore/upgrade-prisma`)

---

## 💾 Commit Conventions

We encourage semantic commit messages:
- `feat: add patient EMR editor`
- `fix: correct doctor slot overlaps`
- `docs: update deployment guidelines`
- `style: format billing controller imports`
- `refactor: extract patient queue state`

---

## 🔀 Pull Request Checklists

Before opening a pull request to the main branch, check that:
1. All lint rules pass cleanly (`yarn lint`).
2. Unit and workspace integration builds run successfully (`yarn build`).
3. You have updated relevant documentation under the `docs/` folder if changing schema mappings or API boundaries.
