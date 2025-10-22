# OmniTrade – Verified Feature Test Plans

The following plans cover application behaviour that currently exists in the OmniTrade codebase. Each feature lists 2–3 automated test scenarios, split between Jest (API/unit) and Playwright (end-to-end UI) where appropriate.

> Use `npx playwright test --reporter=line` (or any non-HTML reporter) when running Playwright locally so the terminal doesn't hang waiting on the interactive report.

---

## Automated Test Inventory

| Test | Tool | Location | What it Verifies |
| :--- | :--- | :--- | :--- |
| HomeView smoke checks | Jest + React Testing Library | `src/__tests__/basic.test.js` | Renders the landing page shell and confirms the “View Portfolio” entry point is present. |
| F05-API-DepositSuccess | Jest (API) | `src/__tests__/api/cashflows.test.js` | Posting a deposit records a positive cash flow for the signed-in user. |
| F05-API-WithdrawInsufficient | Jest (API) | `src/__tests__/api/cashflows.test.js` | Withdrawals larger than the user’s balance return 400 and do not persist anything. |
| F05-API-WithdrawSuccess | Jest (API) | `src/__tests__/api/cashflows.test.js` | Successful withdrawals create a negative deposit record. |
| Cashflow auth guard | Jest (API) | `src/__tests__/api/cashflows.test.js` | Deposit endpoint returns 401 when no user cookie is present. |
| F01-API-BuySuccess | Jest (API) | `src/__tests__/api/trades.test.js` | Valid BUY trades create trade + backlog entries after cash checks. |
| F01-API-SellValidation | Jest (API) | `src/__tests__/api/trades.test.js` | SELL orders exceeding owned shares are rejected with 400. |
| F04-API-HoldingsAggregation | Jest (API) | `src/__tests__/api/portfolio.test.js` | Portfolio endpoint aggregates trades and deposits into holdings, totals, and cash. |
| F04-API-RejectUnauthenticated | Jest (API) | `src/__tests__/api/portfolio.test.js` | Portfolio endpoint enforces authentication. |
| F03-API-Blacklist | Jest (API) | `src/__tests__/api/admin-users.test.js` | Admin PATCH marks a user blacklisted and subsequent login attempts fail. |
| F03-API-UsersAuthGuard | Jest (API) | `src/__tests__/api/admin-users.test.js` | Admin list endpoint denies unauthenticated callers. |
| F10-API-WatchlistAuth | Jest (API) | `src/__tests__/api/watchlist.test.js` | Watchlist endpoint requires a logged-in user. |
| F10-API-WatchlistQuotes | Jest (API) | `src/__tests__/api/watchlist.test.js` | Watchlist response merges stored symbols with fetched quote data. |
| F02-API-Register | Jest (API) | `src/__tests__/api/auth-register.test.js` | Registration creates a new user, hashes the password, and issues the session cookie. |
| F02-API-RegisterConflict | Jest (API) | `src/__tests__/api/auth-register.test.js` | Duplicate registration attempts return 409 without creating a record. |
| F13-API-MarketDataFetch | Jest (API) | `src/__tests__/api/marketdata.test.js` | Market data endpoint normalises Finnhub responses and applies caching. |
| F13-Unit-CachingLayer | Jest (unit) | `src/__tests__/unit/mcache.test.js` | Cache helpers respect TTLs and avoid refetching until entries expire. |
| fetchJsonCached memoisation | Jest (unit) | `src/__tests__/unit/mcache.test.js` | Reuses cached HTTP responses and refetches after expiry. |
| F09-Unit-CSVFormatter | Jest (unit) | `src/__tests__/unit/csv.test.js` | CSV utility escapes commas, quotes, and newlines correctly. |
| CSV empty input guard | Jest (unit) | `src/__tests__/unit/csv.test.js` | CSV helper returns an empty string for falsey/empty inputs. |
| F01-UI-OrderFeedback | Playwright | `tests/e2e/features.spec.js` | Stubbed trade flow posts a BUY order and asserts payload + confirmation dialog. |
| F02-UI-LoginFlow | Playwright | `tests/e2e/features.spec.js` | Login form routes users to the confirmation screen after mocked success. |
| F03-UI-NonAdminRedirect | Playwright | `tests/e2e/features.spec.js` | Non-admin users hitting `/admin` are bounced back to the dashboard. |
| F04-UI-PortfolioStates | Playwright | `tests/e2e/features.spec.js` | Portfolio page shows loading state then mocked totals once data resolves. |
| F12-UI-PortfolioOffline | Playwright | `tests/e2e/features.spec.js` | Portfolio page surfaces an error message when the API returns 500. |
| F06-UI-HistoryListing | Playwright | `tests/e2e/features.spec.js` | Trade backlog renders newest-first rows with correct symbols and types. |
| F06-UI-CSVExport | Playwright | `tests/e2e/features.spec.js` | Export button triggers a CSV download populated with mocked trades. |
| F09-UI-NoTradesExport | Playwright | `tests/e2e/features.spec.js` | Export is blocked with a warning when no trades are available. |
| F10-UI-WatchlistDisplay | Playwright | `tests/e2e/features.spec.js` | Watchlist table shows merged quote data for mocked items. |
| F11-UI-NewsFeed | Playwright | `tests/e2e/features.spec.js` | News page renders headline scaffolding. |
| F12-UI-NavbarConsistency | Playwright | `tests/e2e/features.spec.js` | Core navigation links are present across home, portfolio, trade, and news routes. |
| Portfolio link navigation | Playwright | `tests/e2e/portfolio-watchlist.spec.js` | Home CTA navigates (or redirects) to the portfolio experience. |
| Portfolio metrics visibility | Playwright | `tests/e2e/portfolio-watchlist.spec.js` | `/portfolio` shows either metrics or appropriate loading/auth messaging. |
| Watchlist page access | Playwright | `tests/e2e/portfolio-watchlist.spec.js` | `/watchlist` renders headings and columns or the empty-state messaging. |
| Watchlist star toggle | Playwright | `tests/e2e/portfolio-watchlist.spec.js` | Market data list supports starring an instrument with mocked network responses. |

---

## F01 – Trade Functionality

**Objective:** Validate order placement rules on the trades API and confirm the UI surfaces success and validation feedback.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F01-API-BuySuccess** | Jest (API route) | 1. Seed a user with cash deposits.<br>2. Auth as that user and POST `/api/trades` with a BUY payload (valid symbol/qty/price). | 200 response with created trade payload; trade stored in DB; trade backlog mirror row inserted. |
| **F01-API-SellValidation** | Jest (API route) | 1. Seed user with prior BUY trades for a symbol.<br>2. Submit SELL request exceeding owned quantity. | 400 response with “Not enough shares” error; no new trade/backlog entries created. |
| **F01-UI-OrderFeedback** | Playwright | 1. Log in with seeded cash.<br>2. Navigate to `/trade` and submit a BUY order.<br>3. Stub `/api/trades` to succeed. | Trade form shows success toast/message; mocked endpoint called with correct payload; form resets. |

---

## F02 – User Registration & Login

**Objective:** Ensure credential flows and error handling function through the authentication APIs and UI.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F02-API-Register** | Jest (API route) | POST `/api/auth/register` with unique email/password. | 201 response containing new user; session cookie issued. |
| **F02-API-RegisterConflict** | Jest (API route) | Seed an existing user; re-submit same email. | 409 response with “email already registered”; no additional user stored. |
| **F02-UI-LoginFlow** | Playwright | 1. Visit `/login`.<br>2. Enter valid seeded credentials.<br>3. Submit form. | Redirected to home/dashboard; navbar shows logout button; session cookie present. |

---

## F03 – User Management (Admin)

**Objective:** Verify admin-only actions and restrictions against non-admin accounts.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F03-API-Blacklist** | Jest (API route) | 1. Authenticate as admin.<br>2. PATCH `/api/admin/users/:id` with `{ blacklisted: true }`.<br>3. Attempt login as that user via `/api/auth/login`. | PATCH returns updated user with `blacklisted: true`; subsequent login returns 403 with blacklist message. |
| **F03-UI-NonAdminRedirect** | Playwright | 1. Log in as standard user.<br>2. Browse to `/admin`. | User is redirected to `/` (or denied view); admin UI never renders for non-admin. |
| **F03-API-UsersAuthGuard** | Jest (API route) | Call `/api/admin/users` without session cookie. | 401 response confirming authentication guard. |

---

## F04 – Portfolio Overview

**Objective:** Confirm portfolio aggregation, totals, and UI states for loading/error handling.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F04-API-HoldingsAggregation** | Jest (API route) | Seed trades (BUY/SELL) and deposits; GET `/api/portfolio`. | Holdings list sums share quantities correctly, returns accurate totals and cash values. |
| **F04-API-RejectUnauthenticated** | Jest (API route) | Call `/api/portfolio` without auth. | 401 response with `{ error: "unauthorized" }`. |

---

## F05 – Deposit & Withdrawal

**Objective:** Validate positive cash flow operations and guardrails preventing overdrafts.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F05-API-DepositSuccess** | Jest (API route) | Authenticated POST `/api/deposit` with valid amount. | 200 response; deposit row saved with positive amount; user’s aggregate cash increases. |
| **F05-API-WithdrawInsufficient** | Jest (API route) | Seed limited cash; POST `/api/withdraw` for larger amount. | 400 response with available balance message; no negative deposit recorded. |
| **F05-API-WithdrawSuccess** | Jest (API route) | Seed adequate cash; POST `/api/withdraw` with smaller amount. | 200 response; negative deposit entry stored; aggregate cash reduced correctly. |

---

## F06 – Trade Backlog

**Objective:** Check history display, filtering, and CSV export behaviour in the backlog UI.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F06-UI-HistoryListing** | Playwright | Stub `fetchTradeBacklog` to return multiple trades; open `/trade-backlog`. | Table renders all trades sorted newest-first with correct formatting. |
| **F06-UI-DateFilter** | Playwright | Select date range in picker; provide mock filtered results. | Table updates to show only trades within range; invalid range surfaces warning banner. |
| **F06-UI-CSVExport** | Playwright | With populated table, click “Export CSV”; intercept download. | CSV file generated with headers and matching rows; export blocked (with warning) when table empty. |

---

## F07 – Profile Management

**Objective:** Ensure account profile endpoints return sanitized data, enforce update validation, and the UI handles signed-in/out flows.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F07-API-ProfileFetch** | Jest (API route) | 1. Seed an authenticated user.<br>2. GET `/api/auth/me`. | 200 with `{ user: { id, name, email } }`; no password fields leaked. |
| **F07-API-ProfileBlacklisted** | Jest (API route) | 1. Seed a blacklisted user.<br>2. GET `/api/auth/me` using their cookie. | 403 with `error: "This account has been blacklisted"`; profile omitted. |
| **F07-UI-ProfileEditFlow** | Playwright | 1. Stub `/api/auth/me` to return a user.<br>2. Visit `/profile/edit`, modify name/email, toggle password change, submit.<br>3. Mock PUT `/api/auth/me` to succeed. | PUT called with updated fields (and passwords when toggled); user redirected to `/profile` on success. |

---

## F08 – Price Alerts

**Objective:** Validate alert CRUD endpoints and confirm the market detail UI panel reflects server state.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F08-API-CreateValidation** | Jest (API route) | POST `/api/alerts` without auth, with missing operator, or with non-numeric threshold. | 401 when unauthenticated; 400 with `operator_invalid`/`threshold_invalid` for malformed payloads. |
| **F08-API-DeleteOwnership** | Jest (API route) | 1. Seed alerts for two users.<br>2. Auth as user A and DELETE user B’s alert. | 404 `not_found`; original alert remains in DB. |
| **F08-UI-AlertsPanel** | Playwright | 1. Mock `/api/alerts?symbol=MSFT` to return items.<br>2. Visit `/market-data-display/detail/MSFT`.<br>3. Add and delete alerts via mocked POST/DELETE. | Existing alerts render; create triggers POST with payload; delete removes row without errors. |

---

## F09 – Trade Export Helpers

**Objective:** Ensure CSV utility code produces valid files and UI prevents empty exports.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F09-Unit-CSVFormatter** | Jest (unit) | Call `convertToCSV` with sample trades containing commas/quotes. | Output string quotes values correctly and includes header row. |
| **F09-UI-NoTradesExport** | Playwright | Load `/trade-backlog` with no trades; click export. | Warning “No trades found…” shown; no download triggered. |

---

## F10 – Watchlist & Alerts

**Objective:** Validate existing watchlist fetching logic and UI rendering.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F10-API-WatchlistAuth** | Jest (API route) | Request `/api/watchlist` unauthenticated. | 401 response; no DB access. |
| **F10-API-WatchlistQuotes** | Jest (API route) | Seed watchlist entries; mock downstream market data fetch; GET `/api/watchlist`. | Response returns merged items with symbol, name, price, and change fields. |

---

## F11 – News

**Objective:** Verify news feeds render relevant content for general and stock-specific contexts.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F11-UI-NewsFeed** | Playwright | Stub news API to return sample headlines; navigate to `/news`. | List shows headline, source, and date for each item. |
| **F11-UI-StockNews** | Playwright | Visit `/market-data-display/detail/AAPL`; mock API with AAPL-only articles. | Detail page renders list scoped to requested symbol. |

---

## F12 – UI Consistency & Resilience

**Objective:** Check navigation structure, keyboard accessibility, and offline/error behaviour.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F12-UI-NavbarConsistency** | Playwright | Capture the navbar while visiting `/`, `/portfolio`, `/trade-backlog`, `/news`. | Navbar structure (links, branding, auth actions) identical across pages. |
| **F12-UI-KeyboardNav** | Playwright | Use keyboard (Tab/Enter) to focus and activate navbar links. | Focus styles visible; Enter activates navigation without mouse. |
| **F12-UI-PortfolioOffline** | Playwright | Intercept `/api/portfolio` to timeout/fail. | Loading indicator appears first; failure shows friendly error message; no unhandled exceptions. |

---

## F13 – Market Data API Integration

**Objective:** Confirm the internal market data endpoint normalises provider responses and leverages caching utilities.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F13-API-MarketDataFetch** | Jest (API route) | Mock external provider; GET `/api/marketdata?symbol=TSLA`. | 200 response with symbol uppercased plus price/change fields normalised. |
| **F13-Unit-CachingLayer** | Jest (unit) | Interact with `src/lib/mcache.js`: set item with TTL, read before/after expiry. | Cached value returned on second call within TTL; miss occurs after expiry. |

---

## F14 – News Bookmarks

**Objective:** Confirm bookmark endpoints sync saved articles and the news UI toggles correctly.

| Test ID | Layer / Tool | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| **F14-API-BookmarkUpsert** | Jest (API route) | 1. Auth as user.<br>2. POST `/api/bookmarks` twice with same `articleId` but different titles. | Second call updates existing bookmark; response returns latest title/meta. |
| **F14-API-BookmarkDeleteIdempotent** | Jest (API route) | 1. Seed a bookmark.<br>2. DELETE with correct `articleId` twice. | First call 200 removing row; second call still 200 without throwing. |
| **F14-UI-BookmarkToggle** | Playwright | 1. Stub `/api/auth/me` & `/api/bookmarks`.<br>2. Visit `/news`, toggle bookmark button.<br>3. Mock POST/DELETE responses. | Button state toggles, requests fire with article id, `bookmark:changed` dispatch observed. |
