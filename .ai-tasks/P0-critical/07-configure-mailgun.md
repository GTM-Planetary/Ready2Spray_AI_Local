# Task: Configure Mailgun Email

## Priority: P0 - CRITICAL
## Estimated Complexity: Medium
## Files to Modify: `server/mailgun.ts` or email-related files
## Files to Reference: `todo.md`, `.env.example`

---

## Problem

From the project's `todo.md`:
> Configure Mailgun credentials (MAILGUN_API_KEY, MAILGUN_DOMAIN, FROM_EMAIL)
> Test email delivery with real credentials

Email functionality is not working, which breaks:
- Team member invitations
- Password reset emails
- Job notifications
- Customer communications

---

## Requirements

1. Proper Mailgun configuration with environment variables
2. Email sending utility with error handling
3. Email templates for common operations
4. Fallback behavior when email is not configured (dev mode)

---

## Implementation

### Step 1: Create/Update email configuration

```typescript
// server/email.ts

import Mailgun from 'mailgun.js';
import formData from 'form-data';

interface EmailConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  isConfigured: boolean;
}

function getEmailConfig(): EmailConfig {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.FROM_EMAIL || `noreply@${domain}`;

  const isConfigured = !!(apiKey && domain);

  if (!isConfigured && process.env.NODE_ENV === 'production') {
    console.error(
      '❌ Email not configured! Set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.'
    );
  }

  return {
    apiKey: apiKey || '',
    domain: domain || '',
    fromEmail,
    isConfigured,
  };
}

const config = getEmailConfig();

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = config.isConfigured
  ? mailgun.client({ username: 'api', key: config.apiKey })
  : null;

// Email sending interface
interface SendEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateVariables?: Record<string, string>;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, text, html } = params;

  // Development mode fallback
  if (!config.isConfigured) {
    console.log('📧 [DEV MODE] Email would be sent:');
    console.log(`   To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text?.substring(0, 100)}...`);
    return { success: true, messageId: 'dev-mode-no-send' };
  }

  try {
    const result = await mg!.messages.create(config.domain, {
      from: config.fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}

// Pre-built email templates
export async function sendInvitationEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  inviteLink: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: `You've been invited to join ${organizationName} on Ready2Spray`,
    text: `
${inviterName} has invited you to join ${organizationName} on Ready2Spray.

Click the link below to accept the invitation:
${inviteLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>You've been invited!</h2>
  <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Ready2Spray.</p>
  <p>
    <a href="${inviteLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Accept Invitation
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
</body>
</html>
    `.trim(),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: 'Reset your Ready2Spray password',
    text: `
You requested a password reset for your Ready2Spray account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset</h2>
  <p>You requested a password reset for your Ready2Spray account.</p>
  <p>
    <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Reset Password
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
    `.trim(),
  });
}

// Export config check for health endpoint
export function isEmailConfigured(): boolean {
  return config.isConfigured;
}
```

### Step 2: Update invitation flow

Find where invitations are sent and use the new `sendInvitationEmail` function.

### Step 3: Add email status to health check

```typescript
// In health check endpoint
{
  email: {
    configured: isEmailConfigured(),
    provider: 'mailgun',
  }
}
```

---

## Acceptance Criteria

- [ ] Email configuration reads from environment variables
- [ ] Graceful fallback in development (logs instead of sending)
- [ ] Clear error logging when email fails
- [ ] Invitation emails work with proper template
- [ ] Password reset emails work with proper template
- [ ] Health check reports email configuration status

---

## Testing

1. Without credentials: Should log emails to console
2. With test credentials: Should send to Mailgun sandbox
3. Invalid credentials: Should return error, not crash

---

## Notes for Aider

1. Search for existing email/mailgun files in the server directory
2. Find where invitations are created and sent
3. Ensure the mailgun.js package is installed (`npm install mailgun.js form-data`)
4. Check if there's an existing email utility to update vs. creating new
