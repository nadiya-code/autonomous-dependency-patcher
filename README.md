# DependencyGuard

**Autonomous code dependency vulnerability patcher.** DependencyGuard scans GitHub repositories for vulnerable npm dependencies, generates patches, validates them in a Docker sandbox, and opens a pull request. Developers only review and merge. Nothing is merged automatically.

> Status: work in progress (about 45% complete). See the roadmap below.

## How it works

1. **Connect**: the user installs a GitHub App and chooses which repositories it can access.
2. **Scan**: every `package.json` and lockfile (monorepos included) is checked against the [OSV](https://osv.dev) vulnerability database.
3. **Patch**: the smallest fixed version is chosen for each advisory. Direct dependencies are bumped, transitive ones are pinned with `overrides`. Major bumps are flagged.
4. **Validate**: `npm install`, tests and build run in an isolated Docker container. If any step fails, no pull request is created.
5. **Pull request**: a PR with the updated `package.json`, a regenerated lockfile and a validation report is opened by the GitHub App bot.

## Features

- JWT authentication with bcrypt password hashing
- GitHub App integration with least-privilege access (installation tokens, no long-lived user tokens stored)
- Monorepo-aware vulnerability scanning
- Patch generation with Docker sandbox validation
- Automated pull requests with live open / merged / closed status
- Dashboard with severity breakdown, vulnerabilities and PR tracking
- Public landing page
- Admin panel with owner, admin and delegated "manage admins" roles, user enable/disable and platform stats
- Security hardening: Helmet, rate limiting, request size limits, one patch at a time per user

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| Integrations | GitHub App (Octokit), OSV API |
| Sandbox | Docker (`node:20-slim`) |

## Repository structure

## Run locally

Requirements: Node.js 20+, MongoDB (local or Atlas), Docker Desktop, a GitHub App.

1. Install dependencies in both folders:2. Create `backend/.env` with these variables (values are not included in this repository):
3. Create a GitHub App with **Contents: read and write** and **Pull requests: read and write**, set its callback URL to `http://localhost:5173/github/callback`, and save its private key as `backend/github-app.pem`.
4. Optional: create `web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
5. Start the backend (`npm run dev` in `backend/`, port 5000) and the frontend (`npm run dev` in `web/`, port 5173).
6. To create a platform admin: `node backend/scripts/createAdmin.js` with `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and `ADMIN_NAME` set as environment variables.

Never commit `.env` files or `.pem` keys.

## Limitations

- The Docker sandbox needs a host where the backend can start Docker containers. Platforms such as Render do not allow this.
- Only npm is supported today.
- Scans currently run inside the request (no background jobs yet).
- Billing is not implemented. The planned plan is $1,500 per month per engineering organization.

## Roadmap

- [ ] AI-assisted code migration for breaking changes
- [ ] Teams and organizations
- [ ] Billing (Stripe)
- [ ] Scheduled scans and background jobs
- [ ] Stable production hosting
- [ ] Automated tests

## Author

Nadiya Kola
