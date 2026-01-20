# Task: Add E2E Tests

## Priority: P1 - HIGH
## Estimated Complexity: High
## Files to Create: `e2e/` directory, test files, config files

---

## Problem

The project has only 6 unit test files with no end-to-end testing. Critical user flows are untested:
- User registration and login
- Job creation and management
- Customer operations
- Payment flows

---

## Requirements

1. Set up Playwright for E2E testing
2. Create tests for critical user flows
3. Add to CI/CD pipeline (when created)

---

## Implementation

### Step 1: Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Step 2: Create Playwright config

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Create test utilities

```typescript
// e2e/utils/auth.ts

import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login');
}

// Test user credentials (use test environment)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};
```

### Step 4: Create authentication tests

```typescript
// e2e/auth.spec.ts

import { test, expect } from '@playwright/test';
import { login, logout, TEST_USER } from './utils/auth';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await logout(page);
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

### Step 5: Create job management tests

```typescript
// e2e/jobs.spec.ts

import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './utils/auth';

test.describe('Job Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display jobs list', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('[data-testid="jobs-table"]')).toBeVisible();
  });

  test('should create a new job', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('[data-testid="create-job-button"]');

    // Fill job form
    await page.fill('[data-testid="job-title"]', 'Test Job');
    await page.selectOption('[data-testid="job-customer"]', { index: 1 });
    await page.fill('[data-testid="job-description"]', 'Test description');

    await page.click('[data-testid="save-job-button"]');

    // Verify job was created
    await expect(page.locator('text=Test Job')).toBeVisible();
  });

  test('should edit an existing job', async ({ page }) => {
    await page.goto('/jobs');

    // Click on first job
    await page.click('[data-testid="job-row"]:first-child');

    // Edit
    await page.click('[data-testid="edit-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Updated Job Title');
    await page.click('[data-testid="save-job-button"]');

    // Verify update
    await expect(page.locator('text=Updated Job Title')).toBeVisible();
  });

  test('should filter jobs by status', async ({ page }) => {
    await page.goto('/jobs');

    await page.selectOption('[data-testid="status-filter"]', 'completed');

    // Verify only completed jobs are shown
    const jobs = page.locator('[data-testid="job-row"]');
    for (const job of await jobs.all()) {
      await expect(job.locator('[data-testid="job-status"]')).toContainText('Completed');
    }
  });
});
```

### Step 6: Create customer management tests

```typescript
// e2e/customers.spec.ts

import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './utils/auth';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.locator('[data-testid="customers-table"]')).toBeVisible();
  });

  test('should create a new customer', async ({ page }) => {
    await page.goto('/customers');
    await page.click('[data-testid="create-customer-button"]');

    await page.fill('[data-testid="customer-name"]', 'Test Customer');
    await page.fill('[data-testid="customer-email"]', 'test.customer@example.com');
    await page.fill('[data-testid="customer-phone"]', '555-123-4567');

    await page.click('[data-testid="save-customer-button"]');

    await expect(page.locator('text=Test Customer')).toBeVisible();
  });

  test('should search for customers', async ({ page }) => {
    await page.goto('/customers');

    await page.fill('[data-testid="search-input"]', 'Test');

    const results = page.locator('[data-testid="customer-row"]');
    for (const result of await results.all()) {
      await expect(result).toContainText(/Test/i);
    }
  });
});
```

### Step 7: Add test scripts to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Test Structure

```
e2e/
├── utils/
│   ├── auth.ts          # Authentication helpers
│   ├── fixtures.ts      # Test data
│   └── api.ts           # API helpers for setup/teardown
├── auth.spec.ts         # Authentication tests
├── jobs.spec.ts         # Job management tests
├── customers.spec.ts    # Customer tests
├── personnel.spec.ts    # Personnel tests
├── equipment.spec.ts    # Equipment tests
├── billing.spec.ts      # Stripe/billing tests
└── ai-chat.spec.ts      # AI assistant tests
```

---

## Acceptance Criteria

- [ ] Playwright installed and configured
- [ ] Test utilities created (login, logout, etc.)
- [ ] Authentication flow tests passing
- [ ] Job CRUD tests passing
- [ ] Customer CRUD tests passing
- [ ] Tests run in CI mode
- [ ] Test reports generated

---

## Notes for Aider

1. First check existing test setup and configuration
2. Add `data-testid` attributes to components as needed for testing
3. Create test fixtures for consistent test data
4. Tests should be independent and not rely on database state
5. Consider adding API-level setup/teardown for test data
