# Aider Task Queue (Qwen3 - Coding)

Work through these tasks in order. Mark each `[x]` when complete.

## Usage
```bash
cd "C:\Users\GTM_PLANETARY_RIG 1\OneDrive\Desktop\GTM Planetary Projects\Ready2Spray_AI_Local"
aider --read .ai-tasks/aider-queue.md
```

Then tell Aider: "Work through the task queue starting with the first unchecked item"

---

## P0 - Critical (Must Complete First)

- [x] **Task 1**: Secure shared/.env file
  - File: `.ai-tasks/P0-critical/01-secure-shared-env.md`
  - Action: Update .gitignore, create .env.example

- [x] **Task 2**: Create .env.example
  - File: `.ai-tasks/P0-critical/02-create-env-example.md`
  - Action: Create template env file with placeholder values

- [x] **Task 3**: Fix hardcoded database connection
  - File: `.ai-tasks/P0-critical/03-fix-hardcoded-db-connection.md`
  - Action: Modify `server/db.ts` to use DATABASE_URL env var

- [x] **Task 4**: Create Dockerfile
  - File: `.ai-tasks/P0-critical/04-create-dockerfile.md`
  - Action: Create production Dockerfile

- [ ] **Task 5**: Create README.md
  - File: `.ai-tasks/P0-critical/05-create-readme.md`
  - Action: Create comprehensive project documentation

- [ ] **Task 6**: Fix Stripe configuration
  - File: `.ai-tasks/P0-critical/06-fix-stripe-config.md`
  - Action: Fix Stripe API key configuration

- [ ] **Task 7**: Configure Mailgun email
  - File: `.ai-tasks/P0-critical/07-configure-mailgun.md`
  - Action: Implement email sending with Mailgun

- [ ] **Task 8**: Fix mobile authentication loop
  - File: `.ai-tasks/P0-critical/08-fix-mobile-auth.md`
  - Action: Fix auth redirect loop on mobile devices

- [ ] **Task 9**: Add database indexes
  - File: `.ai-tasks/P0-critical/09-add-database-indexes.md`
  - Action: Add performance indexes to database schema

---

## P1 - High Priority

- [ ] **Task 10**: Consolidate duplicate schemas
  - File: `.ai-tasks/P1-high/01-consolidate-schemas.md`
  - Action: Merge duplicate Zod schemas

- [ ] **Task 11**: Setup error tracking (Sentry)
  - File: `.ai-tasks/P1-high/03-setup-error-tracking.md`
  - Action: Integrate Sentry for error monitoring

- [ ] **Task 12**: Add production logging
  - File: `.ai-tasks/P1-high/04-add-production-logging.md`
  - Action: Implement structured logging

- [ ] **Task 13**: Add rate limiting
  - File: `.ai-tasks/P1-high/05-add-rate-limiting.md`
  - Action: Implement API rate limiting middleware

- [ ] **Task 14**: Add health check endpoint
  - File: `.ai-tasks/P1-high/07-add-health-check.md`
  - Action: Create /health endpoint for monitoring

---

## P2 - Enhancements

- [ ] **Task 15**: Add 2FA/MFA authentication
  - File: `.ai-tasks/P2-enhancements/01-add-2fa-mfa.md`
  - Action: Implement two-factor authentication

- [ ] **Task 16**: Implement WebSocket real-time updates
  - File: `.ai-tasks/P2-enhancements/02-implement-websocket.md`
  - Action: Add real-time notifications

- [ ] **Task 17**: Build customer self-service portal
  - File: `.ai-tasks/P2-enhancements/03-customer-portal.md`
  - Action: Create customer-facing portal

- [ ] **Task 18**: Add invoice generation
  - File: `.ai-tasks/P2-enhancements/04-invoice-generation.md`
  - Action: Implement PDF invoice generation

- [ ] **Task 19**: Split monolithic router
  - File: `.ai-tasks/P2-enhancements/05-split-monolithic-router.md`
  - Action: Refactor routers.ts into separate modules

- [ ] **Task 20**: Setup CI/CD pipeline
  - File: `.ai-tasks/P2-enhancements/06-setup-cicd.md`
  - Action: Create GitHub Actions workflows

---

## Progress Log

| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |
