# Task: Create .env.example File

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Create: `.env.example`
## Files to Reference: `server/db.ts`, `server/routers.ts`, `server/stripe.ts`, `server/mailgun.ts`, `client/src/`

---

## Problem

The project requires 15+ environment variables but has no documentation of what's needed. New developers cannot set up the project without digging through the codebase.

---

## Required Environment Variables

Based on codebase analysis, these variables are needed:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_DATABASE_URL=postgresql://user:password@host:5432/database
R2S_Supabase=your-supabase-password
```

### Authentication
```
JWT_SECRET=your-jwt-secret-min-32-characters
OAUTH_SERVER_URL=https://your-oauth-server.com
OWNER_OPEN_ID=owner-openid-for-bypass
INVITATION_CODE=your-invitation-code
```

### Stripe Payments
```
STRIPE_SECRET_KEY=sk_live_or_sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Email (Mailgun)
```
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

### AWS S3 Storage
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-1
S3_BUCKET=your-bucket-name
```

### AI Services
```
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
OPENAI_API_KEY=sk-your-openai-key
```

### Application
```
VITE_APP_ID=ready2spray
NODE_ENV=development
PORT=3000
```

---

## Implementation Steps

### Step 1: Create .env.example at project root

Create the file with all variables listed above, using placeholder values.

### Step 2: Add comments for each section

Group variables by service and add helpful comments explaining each one.

### Step 3: Add to README reference

Note: Task 05 will create the README, but this file should be self-documenting.

---

## Template

```bash
# ===========================================
# Ready2Spray Environment Configuration
# ===========================================
# Copy this file to .env and fill in your values
# NEVER commit .env to version control
# ===========================================

# -----------------------------
# Database Configuration
# -----------------------------
DATABASE_URL=postgresql://user:password@localhost:5432/ready2spray
# Alternative Supabase connection
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
R2S_Supabase=your-supabase-db-password

# -----------------------------
# Authentication
# -----------------------------
JWT_SECRET=generate-a-secure-random-string-min-32-chars
OAUTH_SERVER_URL=https://your-oauth-provider.com
OWNER_OPEN_ID=owner-user-id-for-admin-bypass
INVITATION_CODE=code-required-for-new-signups

# -----------------------------
# Stripe Payments
# -----------------------------
# Use sk_test_ keys for development, sk_live_ for production
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# -----------------------------
# Email (Mailgun)
# -----------------------------
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
FROM_EMAIL=Ready2Spray <noreply@yourdomain.com>

# -----------------------------
# AWS S3 Storage
# -----------------------------
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-west-1
S3_BUCKET=ready2spray-uploads

# -----------------------------
# AI Services
# -----------------------------
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# -----------------------------
# Application Settings
# -----------------------------
VITE_APP_ID=ready2spray
NODE_ENV=development
PORT=3000
```

---

## Acceptance Criteria

- [ ] `.env.example` exists at project root
- [ ] All required variables are listed with placeholders
- [ ] Variables are grouped by service with comments
- [ ] No real credentials in the file
- [ ] File is NOT in `.gitignore` (it should be committed)

---

## Notes for Aider

Search the codebase for `process.env.` and `import.meta.env.` to find any additional environment variables that may have been missed. Add them to the template.
