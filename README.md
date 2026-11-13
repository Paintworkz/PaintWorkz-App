# PaintWorkz Pro — App

Web-based job management application for spray shops and cabinet & joinery finishing businesses.

**Live app:** [app.paintworkzpro.com.au](https://app.paintworkzpro.com.au)
**Marketing site:** [paintworkzpro.com.au](https://paintworkzpro.com.au) (regional sites for AU, US, UK & Ireland, NZ and Canada)
**Current version:** v1.16.483

---

## What it does

PaintWorkz Pro handles the full spray shop workflow from measurement through to invoicing:

- **Job measurement** — enter doors, panels and drawer fronts part by part (single side, double side or edge return). Area adds up as you go, in m² or sq ft
- **Quoting & invoicing** — pricing matrix by door profile and finish, priced per m²/sq ft, per linear metre/foot or per part, plus colour surcharges, delivery, freight and board supply. Estimates, quotes, invoices and credit notes
- **2 pac formula library** — paint formulas with base codes and tinter amounts, scaled to the litres or gallons needed; mixing cards
- **Paint stock ledger** — stock deducted automatically as jobs are completed
- **Job scheduling** — Gantt-style schedule with job stages, default lead times, public holidays and shop closures (A3 / 11×17 print)
- **PDF documents** — estimates, quotes, invoices, supply dockets, mixing cards, cover sheets, paint orders, part labels and job stickers, with batch printing
- **Reports & KPIs** — area painted, turnaround days, top colours, client breakdown and estimated margin
- **Staff logins** — separate logins that hide pricing from the shop floor
- **Client database** — client management and job history
- **Photo library** — job photo documentation with damage markup
- **Cloud sync** — jobs and settings sync across devices via Firebase Firestore, and keep working if the signal drops

### International
- Metric (mm, m², litres) or imperial (inches, sq ft, US gallons); tinters stay in grams
- Currency, tax (GST / VAT / sales tax) and spelling per shop
- Paper size A4 or US Letter, including US Avery label sheets (5164 / 5163 / 5162)
- Sign-ups from a regional website (`?region=us|uk|nz|ca`) start with that region's settings
- In-app plan prices follow the shop's currency

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML / CSS / JavaScript (single-file app) |
| Auth | Firebase Authentication (Email/Password) |
| Database | Firebase Firestore (modular SDK v12.9.0) |
| Hosting | GitHub Pages + Cloudflare |
| Payments | Paddle (Merchant of Record) |
| Payment webhook | Cloudflare Worker `paddle-webhook` (updates plans in Firestore, emails alerts) |
| PDF output | Client-side PDF generation (jsPDF) |

---

## Repo structure

| File | Purpose |
|------|---------|
| `index.html` | Main application — the live app (full app in one file) |
| `dev.html` | Test copy — new versions are pushed here and tested first, then copied to `index.html` |
| `job.html` | Job detail view |
| `thankyou.html` | Post-signup thank you page |
| `reset.html` | Password reset page |
| `logo.png` | PaintWorkz Pro logo |
| `favicon-32.png`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Browser and phone home-screen icons |
| `icon-preview.png` | Preview image |
| `manifest.json` | PWA manifest (lets the app install to a phone or desktop) |
| `sw.js` | Service worker (offline support) |
| `.github/workflows/` | GitHub Actions deploy pipeline |
| `CNAME` | Custom domain config |
| `netlify.toml`, `netlify/functions/paddle-webhook.js`, `package.json` | Old Netlify payment webhook — no longer used (replaced by the Cloudflare Worker) |

---

## Subscription plans

| Plan | Features |
|------|---------|
| Free | Up to 3 jobs, measuring, mixing cards, supply dockets, schedule, client database |
| Solo | Unlimited jobs, formula library, paint stock ledger, labels, cloud sync — 7-day free trial |
| Pro | Everything in Solo + estimates, quotes, invoices, pricing matrix, reports, staff logins, batch printing |

### Prices (per month, excluding tax)

| Country | Solo | Pro |
|---------|------|-----|
| Australia | A$49 | A$99 (ex GST) |
| United States | US$35 | US$69 |
| United Kingdom | £27 | £55 (ex VAT) |
| Canada | C$52 | C$105 |
| New Zealand | NZ$65 | NZ$129 (ex GST) |
| Ireland | €32 | €65 (ex VAT) |

Payments processed by Paddle. Other countries pay the Australian price converted at checkout. Failed renewals keep the plan while Paddle retries; the plan drops to Free only if the subscription is cancelled or paused.

---

## Built by

Colin Bedford — Victoria, Australia
ABN 90 419 649 257
