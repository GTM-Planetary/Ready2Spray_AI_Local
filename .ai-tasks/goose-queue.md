# Goose Task Queue (llama4 - Research & Testing)

Work through these tasks in order. Mark each `[x]` when complete.

## Usage
```bash
cd "C:\Users\GTM_PLANETARY_RIG 1\OneDrive\Desktop\GTM Planetary Projects\Ready2Spray_AI_Local"
goose session start --prompt "Read .ai-tasks/goose-queue.md and work through the task queue starting with the first unchecked item"
```

---

## P1 - High Priority (Research & Testing)

- [x] **Task 1**: Add E2E Tests - COMPLETED
  - File: `.ai-tasks/P1-high/02-add-e2e-tests.md`
  - Status: Playwright framework set up, tests in e2e/ directory

- [x] **Task 2**: Create API Documentation - COMPLETED
  - File: `.ai-tasks/P1-high/06-create-api-docs.md`
  - Status: docs/API.md created with all tRPC procedures documented

---

## NEW TASKS - Work through these now

- [ ] **Task 3**: Test & Document Stripe Integration
  - Read: `server/stripeRouter.ts` and `.ai-tasks/P0-critical/06-fix-stripe-config.md`
  - Action: Analyze current Stripe implementation, document issues
  - Subtasks:
    - [ ] Review stripeRouter.ts for configuration issues
    - [ ] Check if STRIPE_WEBHOOK_SECRET is properly used
    - [ ] Document what env vars are needed
    - [ ] Test webhook endpoint configuration
    - [ ] Report findings in this file under Research Notes

- [ ] **Task 4**: Test & Document Mailgun Integration
  - Read: `server/routers.ts` (email functions) and `.ai-tasks/P0-critical/07-configure-mailgun.md`
  - Action: Analyze current email implementation, document issues
  - Subtasks:
    - [ ] Find email sending code in server/
    - [ ] Check Mailgun configuration
    - [ ] Document required env vars
    - [ ] Identify any hardcoded values
    - [ ] Report findings in this file under Research Notes

- [ ] **Task 5**: Investigate Mobile Auth Loop
  - Read: `.ai-tasks/P0-critical/08-fix-mobile-auth-loop.md`
  - Action: Research the OAuth redirect issue on mobile devices
  - Subtasks:
    - [ ] Analyze client/src authentication flow
    - [ ] Check OAuth callback handling
    - [ ] Document the loop condition
    - [ ] Propose fix approach for Aider

---

## Research Notes

Use this section to document findings during research:

### E2E Testing Research
- Current test framework: vitest
- Components needing data-testid attributes: (to be filled)
- Authentication flow: (to be analyzed)

### API Documentation Research
- Router type: tRPC
- Number of procedures: (to be counted)
- Authentication method: (to be documented)

---

## Progress Log

| Task | Status | Date | Notes |
|------|--------|------|-------|
| | | | |

---

## Handoff Notes

When research/testing tasks are complete, document any findings that Aider needs to know for related coding tasks:

### For Aider
- Components needing modification: (list here)
- Schema inconsistencies found: (list here)
- Test coverage gaps: (list here)
