[![Build Status](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_apis/build/status%2F1WrongfulGoose6.ASD-OmniTrade?branchName=main)](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_build/latest?definitionId=1&branchName=main)
[![Coverity Scan Build Status](https://scan.coverity.com/projects/32518/badge.svg)](https://scan.coverity.com/projects/1wrongfulgoose6-asd-omnitrade)
[![Board Status](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/42082b11-265f-4c6b-8f3a-de293e801a59/_apis/work/boardbadge/cfaa5c7a-773b-4bc3-812e-6bef28dd0b17?columnOptions=1)](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/_boards/board/t/42082b11-265f-4c6b-8f3a-de293e801a59/Epics/)

# OmniTrade - Stock Trading Platform

### 41026 Advanced Software Development - Spring 2025  
### University of Technology Sydney

OmniTrade is an online broker that allows users to research, trade, and manage their stocks.  
Features include live unit prices, real-time company news, watchlists and alerts, and cash management.

OmniTrade is live on Azure App Services. The URL is included with the assignment submission in the Canvas submission comments.

---

## Tech Stack

OmniTrade is built on **Next.js**, utilising **PostgreSQL** and **Azure App Services**.

- **Frontend**: Next.js 15, React 18, TailwindCSS, lucide-react icons  
- **Server**: Node.js 20, Next.js 15, Prisma ORM  
- **Database**: Azure Flexible Server for PostgreSQL  
- **Auth/Security**: Coverity security scan, jsonwebtoken, bcryptjs, custom CSRF middleware  
- **Testing**: Playwright, Jest, and React Testing Library  

---

## Contributors

| GitHub Username | Name | Student ID |
| ---------------- | ---- | ----------- |
| [1WrongfulGoose6](https://github.com/1WrongfulGoose6) | Ashwin | 25128772 |
| [PrinceAlii](https://github.com/PrinceAlii) | Ali | 24763740 |
| [Savya-Rai](https://github.com/Savya-Rai) | Savya | 24789012 |
| [AW1101](https://github.com/AW1101) | Aston | 24955890 |
| [Kaigagi](https://github.com/Kaigagi) | Henry | 24622983 |

---

## Ownership Map

| Feature ID | Feature | Description | Owner |
| ----------- | -------- | ------------ | ------ |
| F01 | Trade Functionality | Market/limit orders with optional stop loss and take profit. | Ashwin |
| F02 | User Registration | Account creation and profile updates (password resets, etc.). | Aston |
| F03 | User Management | Admin edit/delete/blacklist tooling for accounts. | Aston |
| F04 | Portfolio Overview | Holdings, P/L summary, and time-range performance charts. | Ali |
| F05 | Deposit & Withdrawal | Cash-in/out workflows with validation and confirmations. | Ashwin |
| F06 | Trade Backlog | Trade history views with filter/sort. | Henry |
| F08 | Market Data Display | Real-time price charts and symbol drill-downs. | Henry |
| F09 | Trade Export | Export trade and portfolio data in user-selected formats. | Henry |
| F10 | Watchlist & Alerts | Watchlists plus alert triggers and notifications. | Savya |
| F11 | News | Homepage and symbol-specific news feeds. | Savya |
| F12 | UI Design System | Consistent UI components, layouts, and navigation. | Savya |
| F13 | Market Data API Integration | Finnhub integration and backend proxy endpoints. | Ali |

---

## Repository Structure

```bash
├── src/
│   ├── app/                # Next.js App Router pages + API route handlers
│   ├── components/         # Front-end components (forms, charts, layout, providers)
│   ├── lib/                # Shared libraries (news, quotes, caching, user scope)
│   ├── utils/              # Auth, encryption, logger, Prisma client helpers
│   └── __tests__/          # Jest API/unit tests
├── prisma/                 # Prisma schema, migrations, seed script
├── tests/                  # Playwright tests
├── docs/                   # Design pattern overview and diagrams
├── public/                 # Static assets served by Next.js
├── scripts/                # Deployment helpers (prepare-deploy, DB URL builder, etc.)
```

---

## Local Development (Tutor Setup)

> **Requirements**  
> - Node.js 20

### 1. Clone Repository
```bash
git clone https://github.com/1WrongfulGoose6/ASD-OmniTrade.git
cd ASD-OmniTrade
```

### 2. Configure Environment
- Rename `.env.example` to `.env`
- Ensure the following keys in `.env` are set (**values provided in Canvas submission comments**):
  - `DATABASE_URL`
  - `FINNHUB_API_KEY`
  - `AUTH_SECRET`
  - `PII_ENCRYPTION_KEY`

### 3. Install Dependencies
```bash
npm install
npx playwright install
```

### 4. Database Setup
- Apply migrations:
  ```bash
  npx prisma migrate deploy
  ```
- (Optional) Seed database:
  ```bash
  npx prisma db seed
  ```

### 5. Run Development Server
```bash
npm run dev
```
The app will start on **[http://localhost:3000](http://localhost:3000)**.

### 6. Run Tests
```bash
npm test            # Jest API/unit tests
npx playwright test # Playwright tests
```

## Seeded Trader Accounts

| Name        | Email              | Password  | Notes                  |
| ----------- | ------------------ | --------- | ---------------------- |
| Alice Chen  | `alice@example.com`| `alice123`| Has buy orders and alerts seeded |
| Ben Romero  | `ben@example.com`  | `ben123`  | Includes sell orders and pending backlog |

---

## External Services

### Finnhub (Market Quotes & Company News)
- API key required: `FINNHUB_API_KEY`  
  An API key with unlimited usage (but rate limits) is provided in the Canvas submission comments.  
- The Finnhub API is rate-limited. To mitigate this, an in-memory cache is used (`src/lib/mcache.js`).

### Azure App Services & Azure Flexible Servers for PostgreSQL
- **Subscription**: Pay-as-you-go plan - includes 750 free hours per month and 30 GB of storage.  
- It is unlikely that we will run out of free credits before the end of November.  
  - If we do, a payment card is in place, and we will coordinate with the marker before turning off the service.

---

## Additional Documentation

- [`docs/design-patterns.md`](docs/design-patterns.md) - REST design patterns and architecture diagrams.

---
