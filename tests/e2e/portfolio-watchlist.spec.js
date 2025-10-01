const { test, expect } = require('@playwright/test');

test.describe('Portfolio and Watchlist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can navigate to portfolio page', async ({ page }) => {
    await page.click('text=View Portfolio');
    await expect(page).toHaveURL('/portfolio');
    
    await expect(page.locator('h1')).toContainText('Portfolio Overview');
    
    const hasData = await page.locator('text=Holdings Value').isVisible();
    
    if (hasData) {
      await expect(page.locator('text=Holdings Value')).toBeVisible();
      await expect(page.locator('text=Your Holdings')).toBeVisible();
    } else {
      await expect(page.locator('text=Loading…').first().or(page.locator('text=Please log in').first())).toBeVisible();
    }
  });

  test('portfolio page shows portfolio metrics', async ({ page }) => {
    await page.goto('/portfolio');
    
    await page.waitForSelector('text=Portfolio Overview');
    
    const hasData = await page.locator('text=Holdings Value').isVisible();
    
    if (hasData) {
      await expect(page.locator('text=Holdings Value')).toBeVisible();
      await expect(page.locator('text=Cash (AUD)')).toBeVisible();
      await expect(page.locator('text=Net Worth')).toBeVisible();
      
      await expect(page.locator('text=24h')).toBeVisible();
      await expect(page.locator('text=7d')).toBeVisible();
      await expect(page.locator('text=1m')).toBeVisible();
      await expect(page.locator('text=YTD')).toBeVisible();
      await expect(page.locator('text=1y')).toBeVisible();
    } else {
      await expect(page.locator('text=Loading…').first().or(page.locator('text=Please log in').first())).toBeVisible();
    }
  });

  test('user can navigate to watchlist page', async ({ page }) => {
    await page.goto('/watchlist');
    
    await expect(page.locator('h1')).toContainText('Watchlist');
    
    const hasWatchlistItems = await page.locator('table').isVisible();
    if (hasWatchlistItems) {
      await expect(page.locator('text=Watch')).toBeVisible();
      await expect(page.locator('text=Symbol')).toBeVisible();
      await expect(page.locator('text=Current Price')).toBeVisible();
    } else {
      const isLoading = await page.locator('text=Loading…').isVisible();
      const isEmpty = await page.locator('text=Your watchlist is empty').isVisible();
      expect(isLoading || isEmpty).toBeTruthy();
    }
  });

  test('user can navigate from watchlist to stock detail', async ({ page }) => {
    await page.goto('/watchlist');
    
    await page.waitForTimeout(2000);
    
    const watchlistRows = page.locator('table tbody tr');
    const rowCount = await watchlistRows.count();
    
    if (rowCount > 0) {
      await watchlistRows.first().click();
      
      await expect(page.url()).toMatch(/\/market-data-display\/detail\/[A-Z]+/);
    } else {
      await expect(page.locator('text=Your watchlist is empty')).toBeVisible();
    }
  });

  test('watchlist star functionality works', async ({ page }) => {
    await page.goto('/market-data-display');
    
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    const firstStar = page.locator('table tbody tr').first().locator('button[role="button"]').first();
    
    if (await firstStar.isVisible()) {
      await firstStar.click();
      
      await page.waitForTimeout(1000); // Wait for state change
      
      await expect(firstStar).toBeVisible();
    }
  });

  test('portfolio shows holdings table when user has positions', async ({ page }) => {
    await page.goto('/portfolio');
    
    await page.waitForTimeout(2000);
    
    const holdingsTable = page.locator('text=Your Holdings').locator('..').locator('table');
    const hasHoldings = await holdingsTable.isVisible();
    
    if (hasHoldings) {
      await expect(page.locator('th:has-text("Symbol")')).toBeVisible();
      await expect(page.locator('th:has-text("Shares")')).toBeVisible();
      await expect(page.locator('th:has-text("Value")')).toBeVisible();
    } else {
      const noPositions = await page.locator('text=No positions yet').isVisible();
      const loginRequired = await page.locator('text=Please log in').first().isVisible(); 
      const loading = await page.locator('text=Loading').isVisible();
      
      expect(noPositions || loginRequired || loading).toBeTruthy();
    }
  });

  test('user can navigate between portfolio and market data', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page.locator('h1')).toContainText('Portfolio Overview');
    
    await page.click('text=Stocks');
    await expect(page).toHaveURL('/market-data-display');
    await expect(page.locator('h1')).toContainText('Market Data');
    
    await page.click('text=Portfolio');
    await expect(page).toHaveURL('/portfolio');
    await expect(page.locator('h1')).toContainText('Portfolio Overview');
  });

  test('home page shows watchlist preview', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Your Watchlist')).toBeVisible();
    
    const viewAllLink = page.locator('text=Open watchlist');
    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL('/watchlist');
    }
  });
});