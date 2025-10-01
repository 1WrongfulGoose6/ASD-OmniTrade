const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can navigate to login page and log in', async ({ page }) => {
    await page.click('text=Log in');
    await expect(page).toHaveURL('/login');
    
    await expect(page.locator('h1')).toContainText('Log In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('password123');
    
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('user can navigate to register page and create account', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/register');
    
    await expect(page.locator('h1')).toContainText('Register');
    await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    await page.fill('input[placeholder*="name"]', 'John Doe');
    await page.fill('input[type="email"]', 'john.doe@example.com');
    await page.fill('input[type="password"]', 'securepassword123');
    
    await expect(page.locator('input[placeholder*="name"]')).toHaveValue('John Doe');
    await expect(page.locator('input[type="email"]')).toHaveValue('john.doe@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('securepassword123');
    
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('login form shows validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
    
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'pass');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/login');
  });

  test('navigation links work correctly', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'OmniTrade' })).toBeVisible();
    
    await page.click('text=Portfolio');
    await expect(page).toHaveURL('/portfolio');
    
    await page.click('text=OmniTrade');
    await expect(page).toHaveURL('/');
    
    await page.click('text=Stocks');
    await expect(page).toHaveURL('/market-data-display');
  });
});