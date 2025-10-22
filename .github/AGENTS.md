# OmniTrade Project Index and Summary for AI Agents

This document provides a comprehensive index and summary of the OmniTrade project, designed to be a quick reference for AI agents to understand the codebase, architecture, and key functionalities.

## Project Index

### 1. Configuration Files

- **`.deployignore`**: Specifies files and directories to exclude from Azure deployments.
- **`azure-pipelines.yml`**: Defines the CI/CD pipeline for linting, testing, building, and deploying the application to Azure.
- **`babel.config.jest.js`**: Babel configuration for Jest testing.
- **`eslint.config.mjs`**: ESLint configuration for code linting.
- **`jest.config.js`**: Jest configuration for unit testing.
- **`jest.setup.js`**: Setup file for Jest, importing `@testing-library/jest-dom`.
- **`jsconfig.json`**: JavaScript configuration for setting up base URL and paths.
- **`next.config.mjs`**: Next.js configuration, including security headers, redirects, and environment variable validation.
- **`package.json`**: Lists project dependencies, scripts, and metadata.
- **`playwright.config.js`**: Playwright configuration for end-to-end testing.
- **`postcss.config.mjs`**: PostCSS configuration for Tailwind CSS.
- **`server.js`**: Custom production server for Node.js environments, particularly for Azure App Service.
- **`web.config`**: IIS configuration for Azure deployments, including rewrite rules and security headers.
- **`.azure/templates/setup-node.yml`**: Azure Pipelines template for setting up a consistent Node.js environment.
- **`prisma/schema.prisma`**: Prisma schema for the PostgreSQL database.
- **`prisma/schema.ci.prisma`**: Prisma schema for the SQLite database used in CI/CD.
- **`prisma/seed.js`**: Seed script to populate the database with initial data.

### 2. Source Code (`src/`)

#### a. API Routes (`src/app/api/`)

- **`admin/users/`**: API routes for managing users (GET, DELETE, PATCH).
- **`alerts/`**: API routes for managing price alerts (GET, POST, DELETE).
- **`auth/`**: API routes for authentication (login, logout, me, register).
- **`bookmarks/`**: API routes for managing news bookmarks (GET, POST, DELETE).
- **`deposit/`**: API routes for handling deposits (POST, GET).
- **`marketdata/`**: API routes for fetching market data from Finnhub.
- **`news/`**: API routes for fetching general and company-specific news.
- **`portfolio/`**: API routes for fetching portfolio data, including holdings and history.
- **`tradeBacklog/`**: API route for fetching the trade backlog.
- **`trades/`**: API routes for creating and fetching trades.
- **`watchlist/`**: API routes for managing the user's watchlist.
- **`withdraw/`**: API routes for handling withdrawals.

#### b. Frontend Pages (`src/app/`)

- **`admin/`**: Admin dashboard pages for managing users and blacklisted users.
- **`confirmation/`**: A confirmation page displayed after successful actions.
- **`deposit/`**: Page for users to deposit funds.
- **`login/`**: User login page.
- **`market-data-display/`**: Pages for displaying market data and detailed stock information.
- **`news/`**: Page for displaying the latest news headlines.
- **`portfolio/`**: User portfolio overview page.
- **`profile/`**: User profile page with an option to edit.
- **`register/`**: User registration page.
- **`trade/`**: Page for placing buy/sell orders.
- **`trade-backlog/`**: Page for viewing trade history.
- **`watchlist/`**: User's watchlist page.
- **`withdraw/`**: Page for users to withdraw funds.
- **`layout.js`**: The root layout for the application.
- **`page.js`**: The main entry point for the home page.

#### c. Components (`src/components/`)

- **`AlertsPanel.js`**: A panel for creating and managing price alerts.
- **`BookmarkButton.js`**: A button for bookmarking news articles.
- **`ConfirmationForm.js`**: A form to display a confirmation message.
- **`Header.js`**: The main header of the application (currently not in use).
- **`HomeView.js`**: The main view for the home page.
- **`LoginForm.js`**: The user login form.
- **`NavBar.js`**: The navigation bar component.
- **`NewsGridClient.js`**: A grid for displaying news articles.
- **`NewsLoadMore.js`**: A component for loading more news articles.
- **`OrderForm.js`**: A form for placing buy/sell orders.
- **`Portfolio.js`**: The main component for the portfolio page.
- **`PortfolioChart.js`**: A chart for visualizing portfolio performance.
- **`RegisterForm.js`**: The user registration form.
- **`WatchStar.js`**: A star icon for adding/removing stocks from the watchlist.
- **`WaveBackground.js`**: A decorative background with wave-like patterns.

#### d. Libraries and Utilities (`src/lib/`, `src/utils/`)

- **`bookmarksStore.js`**: Client-side storage for news bookmarks.
- **`formatUtc.js`**: A utility for formatting UTC dates.
- **`mcache.js`**: An in-memory cache for API responses.
- **`userScope.js`**: A utility for managing user-scoped data in local storage.
- **`verifyJWT.js`**: A utility for verifying JSON Web Tokens.
- **`finnhub/news.js`**: A facade for fetching news from the Finnhub API.
- **`http/fetchWithBackoff.js`**: A fetch wrapper with retry and backoff logic.
- **`auth.js`**: A utility for getting the user ID from cookies.
- **`DBClient.js`**: Supabase client initialization.
- **`prisma.js`**: Prisma client initialization.

### 3. Testing (`tests/`, `src/__tests__/`)

- **`e2e/portfolio-watchlist.spec.js`**: End-to-end tests for portfolio and watchlist functionality using Playwright.
- **`src/__tests__/basic.test.js`**: A basic unit test for the `HomeView` component using Jest and React Testing Library.

### 4. Documentation (`docs/`)

- **`design-patterns.md`**: A detailed document explaining the RESTful architecture and design patterns used in the project.

## Project Summary for AI Agents

### Overview

OmniTrade is a web-based cryptocurrency trading platform built with Next.js, React, and Tailwind CSS for the frontend, and Node.js with Prisma for the backend. The application allows users to trade cryptocurrencies, manage their portfolios, and stay updated with market news. It uses a PostgreSQL database in production and SQLite for CI/CD environments.

### Key Features

- **User Authentication**: Users can register, log in, and manage their profiles. Authentication is handled via JWTs stored in cookies.
- **Trading**: Users can place market and limit orders to buy and sell cryptocurrencies. The system checks for sufficient funds for buy orders and sufficient shares for sell orders.
- **Portfolio Management**: Users can view their portfolio, which includes their holdings, cash balance, and performance over time.
- **Watchlist**: Users can add and remove stocks from their watchlist to keep track of their performance.
- **Market Data**: The application fetches real-time market data and historical data from the Finnhub API.
- **News**: Users can view general market news and company-specific news.
- **Admin Dashboard**: An admin-only section for managing users, including blacklisting and deleting accounts.

### Architecture and Design Patterns

The project follows a RESTful architecture with a layered design. Key design patterns and practices include:

- **RESTful Resource Controllers**: API routes are organized by resources (e.g., `/api/trades`, `/api/users`).
- **Singleton (PrismaClient)**: A single instance of `PrismaClient` is used across the application to avoid connection exhaustion.
- **Cache-Aside**: An in-memory cache (`mcache.js`) is used to cache API responses from Finnhub, with a stale-while-revalidate strategy.
- **Retry with Backoff**: The `fetchWithBackoff.js` utility provides resilience when making requests to external APIs.
- **Facade for External APIs**: The `src/lib/finnhub/news.js` module acts as a facade for the Finnhub API, encapsulating the logic for fetching news.
- **CI/CD**: The project has a robust CI/CD pipeline defined in `azure-pipelines.yml` that includes linting, unit testing, end-to-end testing, and deployment to Azure.

### Database

The project uses Prisma as its ORM. The production database is PostgreSQL, while the CI/CD environment uses SQLite. The database schema is defined in `prisma/schema.prisma` and includes tables for users, trades, watchlists, bookmarks, alerts, and deposits.

### Testing

The project has both unit tests and end-to-end tests.
- **Unit tests** are written with Jest and React Testing Library and can be run with `npm test`.
- **End-to-end tests** are written with Playwright and can be run with `npm run test:e2e`.

### Getting Started

To run the project locally, you need to have Node.js and npm installed. After cloning the repository, you can install the dependencies with `npm install` and start the development server with `npm run dev`.
