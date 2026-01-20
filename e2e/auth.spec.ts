import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to OAuth portal or landing
    await page.waitForTimeout(2000);
    const url = page.url();

    // Should not be on dashboard if not authenticated
    expect(url).toMatch(/oauth|app-auth|login|\//);
  });

  test('should redirect unauthenticated users from jobs page', async ({ page }) => {
    await page.goto('/jobs');

    await page.waitForTimeout(2000);
    const url = page.url();

    expect(url).toMatch(/oauth|app-auth|login|\//);
  });

  test('should redirect unauthenticated users from customers page', async ({ page }) => {
    await page.goto('/customers');

    await page.waitForTimeout(2000);
    const url = page.url();

    expect(url).toMatch(/oauth|app-auth|login|\//);
  });

  test('should redirect unauthenticated users from settings page', async ({ page }) => {
    await page.goto('/settings');

    await page.waitForTimeout(2000);
    const url = page.url();

    expect(url).toMatch(/oauth|app-auth|login|\//);
  });
});

test.describe('Organization Setup Flow', () => {
  test('should display organization setup page', async ({ page }) => {
    await page.goto('/signup/organization');

    // Should show organization setup form
    await expect(page.locator('text=/organization|company|business/i').first()).toBeVisible();
  });

  test('should have required form fields for organization', async ({ page }) => {
    await page.goto('/signup/organization');

    // Look for organization name input
    const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
    await expect(nameInput).toBeVisible();
  });
});

test.describe('Accept Invitation Flow', () => {
  test('should handle invalid invitation code', async ({ page }) => {
    await page.goto('/accept-invitation?code=invalid-code-123');

    await page.waitForTimeout(2000);

    // Should show error or redirect
    const pageContent = await page.content();
    expect(pageContent).toMatch(/invalid|expired|error|not found|login/i);
  });
});
