
[![Board Status](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/42082b11-265f-4c6b-8f3a-de293e801a59/_apis/work/boardbadge/cfaa5c7a-773b-4bc3-812e-6bef28dd0b17?columnOptions=1)](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/_boards/board/t/42082b11-265f-4c6b-8f3a-de293e801a59/Epics/)
[![Build Status](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_apis/build/status%2F1WrongfulGoose6.ASD-OmniTrade?branchName=main)](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_build/latest?definitionId=1&branchName=main)
[![Coverity Scan Build Status](https://scan.coverity.com/projects/32518/badge.svg)](https://scan.coverity.com/projects/1wrongfulgoose6-asd-omnitrade)


# OmniTrade — Crypto Trading Platform

OmniTrade lets users search equity symbols, place market/limit orders, track holdings, set watchlists/alerts, read real-time company news, and manage cash movements. The app is built with Next.js (App Router) and Prisma, deployed to Azure App Services with an Azure Flexible Server PostgreSQL backend.

---

## Repository Structure

```
├── src/
│   ├── app/                # Next.js App Router pages + API route handlers
│   ├── components/         # Client components (forms, charts, layout, providers)
│   ├── lib/                # Shared libraries (news, quotes, caching, user scope)
│   ├── utils/              # Auth, encryption, logger, Prisma client helpers
│   └── __tests__/          # Jest API/unit tests (plus lib coverage)
├── prisma/                 # Prisma schema, migrations, seed script
├── tests/                  # Playwright end-to-end test specs
├── docs/                   # Design pattern overview and diagrams
├── public/                 # Static assets served by Next.js
├── scripts/                # Deployment helpers (prepare-deploy, db URL builder, etc.)
└── .github/AGENTS.md       # Agent-focused project index
```

### Ownership Map

| Feature ID | Feature | Description | Owner |
| --- | --- | --- | --- |
| F01 | Trade Functionality | Market/limit orders with optional stop loss & take profit. | Ashwin |
| F02 | User Registration | Account creation & profile updates (password resets, etc.). | Aston |
| F03 | User Management | Admin edit/delete/blacklist tooling for accounts. | Aston |
| F04 | Portfolio Overview | Holdings, P/L summary, time-range performance charts. | Ali |
| F05 | Deposit & Withdrawal | Cash-in/out workflows with validation and confirmations. | Ashwin |
| F06 | Trade Backlog | Trade history views with filter/sort. | Henry |
| F08 | Market Data Display | Real-time price charts and symbol drill-downs. | Henry |
| F09 | Trade Export | Export trade and portfolio data in user-selected formats. | Henry |
| F10 | Watchlist & Alerts | Watchlists plus alert triggers/notifications. | Savya |
| F11 | News | Homepage & symbol-specific news feeds. | Savya |
| F12 | UI Design System | Consistent UI components, layouts, navigation. | Savya |
| F13 | Market Data API Integration | Finnhub integration + backend proxy endpoints. | Ali |

---

## Running the Project (Tutor Setup)

> **Requirements**: Node.js 18+, npm 9+, Git. The app expects environment variables for Finnhub and the Azure PostgreSQL instance—see `.env` for sample values.

1. **Clone**
   ```bash
   git clone https://github.com/1WrongfulGoose6/ASD-OmniTrade.git
   cd ASD-OmniTrade
   ```
2. **Configure Environment**
   - Copy `.env` to `.env.local` (Next.js convention).
   - Ensure the following keys are set:
     - `DATABASE_URL` (Azure Flexible Server PostgreSQL connection string)
     - `FINNHUB_API_KEY` (see “External Services” below)
     - `AUTH_SECRET`, `PII_ENCRYPTION_KEY` (JWT + PII encryption)
   - Prisma will warn if `DATABASE_URL` is missing on startup.
3. **Install Dependencies**
   ```bash
   npm install
   ```
4. **Database**
   - Apply migrations: `npx prisma migrate deploy`
   - Optional seed: `node prisma/seed.js`
5. **Run Dev Server**
   ```bash
   npm run dev
   ```
   The app will start on [http://localhost:3000](http://localhost:3000). Use the seeded credentials (if provided) or register a new account.
6. **Run Tests**
   ```bash
   npm test          # Jest API/unit tests
   npm run test:e2e  # Playwright specs (requires dev server)
   ```

---

## Frameworks & Dependencies

- **Frontend**: Next.js 15, React 18, TailwindCSS, lucide-react icons.
- **Server**: Node.js 18 runtime, Next.js Route Handlers, Prisma ORM.
- **Database**: Azure Flexible Server for PostgreSQL (Pay-as-you-go with 750 free hours/month & 30 GB storage).
- **Auth/Security**: `jsonwebtoken`, bcryptjs, custom CSRF middleware, AES-256-GCM encryption for PII.
- **Testing**: Jest, @testing-library/react, Playwright.

---

## External Services & Availability

- **Finnhub** (market quotes & company news)
  - API Key required (`FINNHUB_API_KEY`).
  - Rate limited; in-memory cache (`src/lib/mcache.js`) mitigates usage.
  - Service availability depends on Finnhub’s SLA; no hard expiry, but keys may rotate.
- **Azure App Services** (hosting) & **Azure Flexible Servers for PostgreSQL** (database)
  - Subscription: Pay-as-you-go, currently within the 750 free-hours/month + 30 GB tier.
  - If the free quota is exceeded, Azure charges per usage; credentials remain valid.

---

## Additional Documentation

- `docs/design-patterns.md` — REST design patterns, architecture diagrams.
- `.github/AGENTS.md` — agent-specific knowledge base.
- `scripts/prepare-deploy.sh` — packaging steps for Azure deployment.

---
