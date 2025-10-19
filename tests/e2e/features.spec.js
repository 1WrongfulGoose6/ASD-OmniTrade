const { test, expect } = require('@playwright/test');

const sampleUser = { id: 7, email: 'trader@example.com', name: 'Taylor Trader' };

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(payload),
  };
}

async function mockAuth(page, user = sampleUser) {
  await page.route('**/api/auth/me', (route) => {
    route.fulfill(
      jsonResponse({
        user: user || null,
      }),
    );
  });
}

async function mockWatchlist(page, items = []) {
  await page.route('**/api/watchlist', (route) => {
    route.fulfill(jsonResponse({ items }));
  });
}

async function mockMarketdataList(page, rows = []) {
  await page.route('**/api/marketdata', (route) => {
    route.fulfill(jsonResponse(rows));
  });
}

test.describe('Feature scenarios', () => {
  test('F01-UI-OrderFeedback: submits a buy order and shows confirmation', async ({ page }) => {
    await mockAuth(page);
    await page.route('**/api/marketdata/detail/**', (route) =>
      route.fulfill(
        jsonResponse({
          historicalData: [],
          currentPrice: 120.5,
          name: 'Apple Inc.',
        }),
      ),
    );
    await mockMarketdataList(page, []);

    let capturedPayload = null;
    await page.route('**/api/trades', (route) => {
      capturedPayload = JSON.parse(route.request().postData());
      route.fulfill(jsonResponse({ ok: true, trade: { id: 123 } }));
    });

    const dialogs = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
      dialog.accept();
    });

    await page.goto('/trade?symbol=AAPL&price=120');
    await page.getByPlaceholder('e.g. 1.5').fill('2');
    await page.getByRole('button', { name: 'Place Buy Order' }).click();

    await expect.poll(() => dialogs.length).toBe(1);
    expect(dialogs[0]).toContain('Trade submitted');
    expect(capturedPayload).toMatchObject({
      symbol: 'AAPL',
      side: 'BUY',
      qty: 2,
    });
    expect(capturedPayload.price).toBeCloseTo(120.5, 5);
  });

  test('F02-UI-LoginFlow: successful login redirects to confirmation', async ({ page }) => {
    let authenticated = false;
    const loggedInUser = { id: 22, email: 'member@example.com', name: 'Member' };

    await page.route('**/api/auth/me', (route) => {
      route.fulfill(
        jsonResponse({
          user: authenticated ? loggedInUser : null,
        }),
      );
    });

    await mockWatchlist(page, []);
    await mockMarketdataList(page, []);

    await page.route('**/api/auth/login', (route) => {
      authenticated = true;
      route.fulfill(jsonResponse({ ok: true, user: loggedInUser }));
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('member@example.com');
    await page.getByLabel('Password').fill('super-secret');
    await page.getByRole('button', { name: 'Log in' }).click();

    await page.waitForURL('**/confirmation**');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Login successful!');
  });

  test('F03-UI-NonAdminRedirect: standard user is redirected away from admin', async ({ page }) => {
    const regularUser = { id: 5, email: 'user@example.com', name: 'Regular User' };
    await mockAuth(page, regularUser);
    await page.route('**/api/admin/users', (route) => {
      route.fulfill(jsonResponse({ error: 'unauthorized' }, 401));
    });

    await page.goto('/admin');
    await page.waitForURL('**/');
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByText('View Portfolio')).toBeVisible();
  });

  test('F04-UI-PortfolioStates: shows loading then totals on success', async ({ page }) => {
    await mockAuth(page);

    const payload = {
      holdings: [
        {
          symbol: 'AAPL',
          price: 120,
          change: 1.2,
          changePercent: 1,
          shares: 4,
          avgCost: 100,
          value: 480,
          profitLoss: 80,
        },
      ],
      totals: {
        totalValue: 480,
        totalProfitLoss: 80,
        cashAud: 520,
      },
      totalsWithCash: {
        totalValue: 1000,
        totalProfitLoss: 80,
      },
    };

    await page.route('**/api/portfolio', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      route.fulfill(jsonResponse(payload));
    });

    await page.goto('/portfolio');
    await expect(page.getByText('Loading…').first()).toBeVisible();
    await expect(page.getByText('Holdings Value')).toBeVisible();
    await expect(page.getByText('$480.00').first()).toBeVisible();
    await expect(page.getByText('$520.00').first()).toBeVisible();
  });

  test('F12-UI-PortfolioOffline: graceful error when portfolio API fails', async ({ page }) => {
    await mockAuth(page);
    await page.route('**/api/portfolio', (route) => {
      route.fulfill(jsonResponse({ error: 'internal_error' }, 500));
    });

    await page.goto('/portfolio');
    await expect(page.getByText('internal_error').first()).toBeVisible();
  });

  test('F06-UI-HistoryListing: renders trade backlog rows in newest-first order', async ({ page }) => {
    await mockAuth(page);
    const trades = [
      {
        id: 99,
        asset: 'TSLA',
        type: 'Sell',
        amount: 3000,
        status: 'Completed',
        date: '2024-03-05T10:00:00Z',
      },
      {
        id: 42,
        asset: 'AAPL',
        type: 'Buy',
        amount: 1500,
        status: 'Completed',
        date: '2024-02-01T09:00:00Z',
      },
    ];

    await page.route('**/api/tradeBacklog', (route) => route.fulfill(jsonResponse(trades)));

    await page.goto('/trade-backlog');
    const newestRow = page.getByRole('row', { name: /99/ });
    await expect(newestRow).toBeVisible();
    await expect(newestRow).toContainText('TSLA');
    await expect(newestRow).toContainText('Sell');

    const olderRow = page.getByRole('row', { name: /42/ });
    await expect(olderRow).toBeVisible();
    await expect(olderRow).toContainText('AAPL');
    await expect(olderRow).toContainText('Buy');
  });

  test('F06-UI-CSVExport: download contains current trade backlog', async ({ page }) => {
    await mockAuth(page);
    const trades = [
      {
        id: 1,
        asset: 'AAPL',
        type: 'Buy',
        amount: 1200,
        status: 'Completed',
        date: '2024-01-01T00:00:00Z',
      },
    ];
    await page.route('**/api/tradeBacklog', (route) => route.fulfill(jsonResponse(trades)));

    await page.goto('/trade-backlog');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Trade_Backlog_/);
  });

  test('F09-UI-NoTradesExport: warns when exporting with no trades', async ({ page }) => {
    await mockAuth(page);
    await page.route('**/api/tradeBacklog', (route) => route.fulfill(jsonResponse([])));

    await page.goto('/trade-backlog');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect(page.getByText('Cannot export: No trades found matching current filters.')).toBeVisible();
  });

  test('F10-UI-WatchlistDisplay: shows watchlist entries with market data', async ({ page }) => {
    await mockAuth(page);
    const items = [
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420, change: '+1.1%', marketCap: '2.4T' },
      { symbol: 'AAPL', name: 'Apple Inc.', price: 180, change: '-0.4%', marketCap: '2.9T' },
    ];
    await mockWatchlist(page, items);
    await mockMarketdataList(page, items);

    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: 'Watchlist' })).toBeVisible();
    const msftRow = page.getByRole('row', { name: /Microsoft Corp\./ });
    await expect(msftRow).toContainText('MSFT');
    await expect(msftRow).toContainText('420');

    const aaplRow = page.getByRole('row', { name: /Apple Inc\./ });
    await expect(aaplRow).toContainText('AAPL');
    await expect(aaplRow).toContainText('180');
  });

  test('F11-UI-NewsFeed: news page renders headlines section', async ({ page }) => {
    await mockAuth(page);
    await page.goto('/news');
    await expect(page.getByRole('heading', { level: 1, name: 'News' })).toBeVisible();
    await expect(page.getByText('Latest market headlines.')).toBeVisible();
  });

  test('F12-UI-NavbarConsistency: core navigation links appear across key pages', async ({ page }) => {
    const navLinks = ['Stocks', 'News', 'Watchlist', 'Portfolio', 'Profile', 'History', 'Settings'];
    await mockAuth(page);
    await mockWatchlist(page, []);
    await mockMarketdataList(page, []);
    await page.route('**/api/portfolio', (route) =>
      route.fulfill(
        jsonResponse({
          holdings: [],
          totals: { totalValue: 0, totalProfitLoss: 0, cashAud: 0 },
          totalsWithCash: { totalValue: 0, totalProfitLoss: 0 },
        }),
      ),
    );

    const pagesToCheck = ['/', '/portfolio', '/trade', '/news'];

    for (const path of pagesToCheck) {
      await page.goto(path);
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      for (const link of navLinks) {
        await expect(nav.getByRole('link', { name: link })).toBeVisible();
      }
    }
  });
});
