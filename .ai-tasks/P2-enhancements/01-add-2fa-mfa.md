# Task: Add Two-Factor Authentication (2FA/MFA)

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: High
## Files to Modify: Auth routes, user settings, database schema

---

## Overview

Add two-factor authentication to improve account security. Support multiple methods:
- TOTP (Time-based One-Time Password) via authenticator apps
- SMS codes (optional, requires Twilio)
- Email codes (using existing Mailgun)

---

## Requirements

1. TOTP setup with QR code generation
2. Backup recovery codes
3. 2FA verification on login
4. 2FA management in user settings
5. Admin can require 2FA for organization

---

## Implementation Outline

### Database Schema Changes

```typescript
// Add to user table
twoFactorEnabled: boolean('two_factor_enabled').default(false),
twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
twoFactorMethod: varchar('two_factor_method', { length: 20 }), // 'totp', 'sms', 'email'

// New table for backup codes
export const backupCodes = pgTable('backup_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  code: varchar('code', { length: 255 }).notNull(), // Hashed
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Required Packages

```bash
npm install otplib qrcode
npm install -D @types/qrcode
```

### Key Endpoints

1. `POST /api/auth/2fa/setup` - Initialize TOTP setup, return QR code
2. `POST /api/auth/2fa/verify` - Verify TOTP code and enable 2FA
3. `POST /api/auth/2fa/disable` - Disable 2FA (requires password)
4. `GET /api/auth/2fa/backup-codes` - Generate backup codes
5. `POST /api/auth/2fa/challenge` - Verify 2FA during login

### Frontend Components

1. 2FA setup wizard with QR code
2. 2FA verification dialog on login
3. Backup codes display/regenerate
4. 2FA settings in account preferences

---

## Acceptance Criteria

- [ ] Users can enable TOTP 2FA
- [ ] QR code generated for authenticator apps
- [ ] Backup codes generated and displayed
- [ ] Login requires 2FA when enabled
- [ ] Users can disable 2FA with password
- [ ] Backup codes work when primary method unavailable

---

## Notes for Aider

This is a significant feature. Consider implementing in phases:
1. Phase 1: TOTP only
2. Phase 2: Backup codes
3. Phase 3: Organization-level policies
4. Phase 4: Additional methods (SMS, email)

Reference existing auth implementation to maintain consistency.
