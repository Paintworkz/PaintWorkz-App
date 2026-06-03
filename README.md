# PaintWorkz Pro — App

Web-based job management application for spray shops and cabinet & joinery finishing businesses.

**Live app:** [app.paintworkzpro.com.au](https://app.paintworkzpro.com.au)  
**Marketing site:** [paintworkzpro.com.au](https://paintworkzpro.com.au)

---

## What it does

PaintWorkz Pro handles the full spray shop workflow from measurement through to invoicing:

- **Job measurement** — Enter panels, doors and surfaces with dimensions. Auto-calculates square meterage and generates parts lists
- **Quoting & invoicing** — Pricing matrix applies automatically based on door profile and finish
- **PDF documents** — Estimates, quotes, invoices, supply dockets, mixing cards and part labels
- **2Pac formula library** — Store and recall paint formulas by job
- **Job scheduling** — A3 Gantt-style work schedule across all active jobs
- **Cloud sync** — Jobs and settings sync across devices via Firebase Firestore
- **Client database** — Full client management and job history
- **Photo library** — Job photo documentation with damage markup

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML / CSS / JavaScript (single-file app) |
| Auth | Firebase Authentication (Email/Password) |
| Database | Firebase Firestore (modular SDK v12.9.0) |
| Hosting | GitHub Pages + Cloudflare |
| Payments | Paddle (Merchant of Record) |
| PDF output | Client-side PDF generation |

---

## Repo structure

| File | Purpose |
|------|---------|
| `index.html` | Main application (full app in one file) |
| `job.html` | Job detail view |
| `thankyou.html` | Post-signup thank you page |
| `reset.html` | Password reset page |
| `dev.html` | Development/testing page |
| `logo.png` | PaintWorkz Pro logo |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (offline support) |
| `netlify.toml` | Netlify config |
| `netlify/functions/` | Paddle webhook handler |
| `.github/workflows/` | GitHub Actions deploy pipeline |
| `CNAME` | Custom domain config |

---

## Subscription tiers

| Plan | Price | Features |
|------|-------|---------|
| Free | $0/month | Up to 3 jobs, mixing cards, schedule, client database |
| Solo | $49 AUD/month | Unlimited jobs, cloud sync, supply dockets, formula library |
| Pro | $99 AUD/month | Everything + quotes, invoices, pricing matrix, staff logins |

Payments processed by Paddle. 7-day free trial on Solo.

---

## Built by

Colin Bedford — Victoria, Australia  
ABN 90 419 649 257  
