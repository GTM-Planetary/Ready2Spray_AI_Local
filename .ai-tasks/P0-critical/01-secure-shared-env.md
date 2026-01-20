# Task: Secure shared/.env File

## Priority: P0 - CRITICAL
## Estimated Complexity: Low
## Files to Modify: `.gitignore`, `shared/.env`

---

## Problem

The `shared/.env` file exists in the repository but is NOT included in `.gitignore`. This file may contain sensitive credentials that could be exposed if committed to version control.

The current `.gitignore` only excludes `.env` at the root level, not `shared/.env`.

---

## Requirements

1. Add `shared/.env` to `.gitignore`
2. Add a general pattern to catch any nested `.env` files
3. Verify no secrets are already committed (check git history if applicable)

---

## Implementation Steps

### Step 1: Update .gitignore

Add these lines to `.gitignore`:

```gitignore
# Environment files (all locations)
.env
.env.*
**/.env
**/.env.*
shared/.env
```

### Step 2: Remove from git tracking (if tracked)

If the file is already tracked by git, run:

```bash
git rm --cached shared/.env
```

### Step 3: Create shared/.env.example

Create a template file `shared/.env.example` with placeholder values (no real secrets) so developers know what variables are needed.

---

## Acceptance Criteria

- [ ] `shared/.env` is in `.gitignore`
- [ ] Pattern `**/.env` added to catch nested env files
- [ ] `shared/.env.example` created with placeholder values
- [ ] No real credentials in any committed files

---

## Notes for Aider

Focus on the `.gitignore` file first. If you find the `shared/.env` file, read it to understand what variables it contains, then create the `.env.example` template with those variable names but dummy values like `your-api-key-here`.
