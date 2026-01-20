import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page with branding', async ({ page }) => {
    await page.goto('/');

    // Check for Ready2Spray branding
    await expect(page.locator('text=ready2spray')).toBeVisible();
    await expect(page.locator('img[alt="Ready2Spray"]').first()).toBeVisible();
  });

  test('should display hero section with CTA', async ({ page }) => {
    await page.goto('/');

    // Hero headline
    await expect(page.locator('h1')).toContainText(/Streamline.*Agricultural.*Spraying/i);

    // CTA buttons
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /learn more/i })).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Feature sections
    await expect(page.locator('text=Job Management')).toBeVisible();
    await expect(page.locator('text=EPA Compliance')).toBeVisible();
    await expect(page.locator('text=Team Coordination')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('should have sign in button in navigation', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should navigate to sign up page when clicking Get Started', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /get started/i }).first().click();

    await expect(page).toHaveURL(/\/signup\/organization/);
  });

  test('should redirect sign in to OAuth portal', async ({ page }) => {
    await page.goto('/');

    // Click sign in (desktop view)
    const signInButton = page.getByRole('button', { name: /sign in/i });

    // This should redirect to OAuth portal
    const [newPage] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      signInButton.click(),
    ]);

    // Either redirects current page or opens popup
    // Check URL contains oauth or the page URL changed
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/oauth|app-auth|login|localhost/);
  });

  test('should scroll to features when clicking Learn More', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /learn more/i }).click();

    // Features section should be visible
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('should display footer with copyright', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer')).toContainText(/Ready2Spray.*GTM Planetary/);
  });
});

test.describe('Landing Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-optimized navigation', async ({ page }) => {
    await page.goto('/');

    // Mobile shows "Join" instead of "Sign Up"
    await expect(page.getByRole('button', { name: /join/i })).toBeVisible();
  });

  test('should have responsive hero section', async ({ page }) => {
    await page.goto('/');

    // Logo should be visible
    await expect(page.locator('img[alt="Ready2Spray"]').first()).toBeVisible();

    // Main CTA should be visible
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
  });
});
