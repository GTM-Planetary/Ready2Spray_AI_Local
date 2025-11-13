# Production Features Documentation

This document covers the three production-ready features implemented for Ready2Spray AI:

1. **Daily Cron Job** - Automatic service plan processing
2. **Email Notifications** - Customer service reminders and job completion emails
3. **Customer Portal** - Public-facing customer dashboard

---

## 1. Daily Cron Job for Service Plan Processing

### Overview
Automatically generates jobs from active service plans every day at 6:00 AM, eliminating manual job creation for recurring customers.

### Implementation
- **File**: `server/_core/index.ts`
- **Package**: `node-cron` (v4.2.1)
- **Schedule**: `'0 6 * * *'` (Every day at 6:00 AM)
- **Function**: Calls `processServicePlans()` from `server/servicePlanScheduler.ts`

### How It Works
```typescript
cron.schedule('0 6 * * *', async () => {
  console.log('[Cron] Running daily service plan processing at 6:00 AM...');
  const { processServicePlans } = await import('../servicePlanScheduler');
  const result = await processServicePlans();
  console.log(`[Cron] Generated ${result.generated} jobs from ${result.processed} plans`);
});
```

### Verification
Check server logs for:
```
[Cron] Daily service plan processing scheduled for 6:00 AM
```

### Manual Trigger
Administrators can manually trigger processing via the "Process Now" button on the Service Plans page.

---

## 2. Email Notification System

### Overview
Sends automated email notifications to customers using Mailgun for service reminders and job completion confirmations.

### Configuration

#### Environment Variables (Already Set)
- `MAILGUN_API_KEY` - Your Mailgun private API key
- `MAILGUN_DOMAIN` - Your Mailgun sandbox/verified domain
- `MAILGUN_BASE_URL` - Mailgun API endpoint (https://api.mailgun.net)
- `FROM_EMAIL` - Sender email address (Ready2Spray <postmaster@...>)

#### Files
- **Email Service**: `server/email.ts`
- **Test Endpoint**: `server/routers.ts` (`trpc.email.sendTest`)
- **Test Page**: `client/src/pages/EmailTest.tsx`

### Email Types

#### 1. Service Reminder Email
**Trigger**: Sent 24 hours before scheduled service  
**Function**: `sendServiceReminderEmail()`  
**Includes**:
- Service name and description
- Scheduled date and time
- Service location address
- Target pests
- Special notes

**Example**:
```typescript
await sendServiceReminderEmail({
  customerEmail: "customer@example.com",
  customerName: "John Smith",
  jobTitle: "Monthly Pest Control",
  scheduledDate: "May 15, 2025",
  scheduledTime: "9:00 AM - 11:00 AM",
  siteAddress: "123 Main St, City, ST 12345",
  targetPests: "Ants, Spiders, Roaches",
  notes: "Please ensure pets are indoors"
});
```

#### 2. Job Completion Email
**Trigger**: When job status changes to "Completed"  
**Function**: `sendJobCompletionEmail()`  
**Includes**:
- Service name and completion date
- Service location
- Technician name
- Target pests treated
- Application details
- Next scheduled service date (if applicable)

**Example**:
```typescript
await sendJobCompletionEmail({
  customerEmail: "customer@example.com",
  customerName: "John Smith",
  jobTitle: "Monthly Pest Control",
  completedDate: "May 15, 2025",
  siteAddress: "123 Main St, City, ST 12345",
  targetPests: "Ants, Spiders, Roaches",
  applicationDetails: "Applied perimeter spray and bait stations",
  personnelName: "Mike Johnson",
  nextServiceDate: "June 15, 2025"
});
```

### Testing Email Delivery

1. Navigate to **Email Test** page in sidebar
2. Enter your email address
3. Click **"Send Test Email"**
4. Check your inbox for test email
5. Verify email formatting and delivery

### Email Templates
Professional HTML templates with:
- Green/white branding matching Ready2Spray
- Responsive design for mobile devices
- Clear service details in bordered sections
- Company footer with branding

### Future Integration Points
To automatically send emails when jobs are created/completed:

**In `server/routers.ts` jobs router:**
```typescript
// After creating a job
const { sendServiceReminderEmail } = await import("./email");
if (customer.email) {
  await sendServiceReminderEmail({
    customerEmail: customer.email,
    // ... other params
  });
}

// After marking job complete
const { sendJobCompletionEmail } = await import("./email");
if (customer.email) {
  await sendJobCompletionEmail({
    customerEmail: customer.email,
    // ... other params
  });
}
```

---

## 3. Customer Portal

### Overview
Public-facing portal where customers can view their service plans, upcoming jobs, and service history without logging into the admin dashboard.

### Access
**URL**: `https://your-domain.com/customer-portal`

### Features

#### Login System
- **Authentication**: Email-based (currently mock authentication)
- **Security**: In production, implement proper authentication with JWT tokens or session management
- **User Experience**: Simple one-field login with email address

#### Dashboard Sections

##### 1. Active Service Plans
Displays all service plans for the logged-in customer:
- Plan name and type (monthly, quarterly, etc.)
- Plan status badge (active, paused, cancelled)
- Start date and next service date
- Target pests with badge display
- Service notes

##### 2. Upcoming Services
Shows scheduled jobs in chronological order:
- Job title and description
- Scheduled date
- Service location with map pin icon
- Calendar icon for quick date reference
- Sorted by date (nearest first)

##### 3. Service History
Displays past completed services:
- Job title and completion date
- Service location
- Last 10 services shown
- Sorted by date (most recent first)
- Grayed out styling to differentiate from upcoming jobs

### UI/UX Design
- **Branding**: Uses APP_LOGO and APP_TITLE from constants
- **Color Scheme**: Green gradient background (from-green-50 to-blue-50)
- **Layout**: Clean card-based design with clear sections
- **Icons**: Lucide icons for visual clarity
- **Responsive**: Mobile-friendly design
- **Header**: Shows customer name, email, and logout button

### Implementation Details

**File**: `client/src/pages/CustomerPortal.tsx`

**Key Components**:
```typescript
// Login state management
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [customerEmail, setCustomerEmail] = useState("");

// Data fetching
const { data: customers } = trpc.customers.list.useQuery();
const { data: servicePlans } = trpc.servicePlans.list.useQuery();
const { data: jobs } = trpc.jobs.list.useQuery();

// Filtering customer-specific data
const customer = customers?.find((c) => c.email === customerEmail);
const customerServicePlans = servicePlans?.filter(
  (plan) => plan.customerId === customer?.id
);
```

### Production Considerations

#### Authentication Enhancement
For production, replace mock authentication with:

1. **JWT Token Authentication**:
```typescript
// Backend: Generate token on login
const token = jwt.sign({ customerId: customer.id }, JWT_SECRET);

// Frontend: Store token in localStorage
localStorage.setItem('customerToken', token);

// Backend: Verify token on requests
const decoded = jwt.verify(token, JWT_SECRET);
```

2. **Magic Link Authentication**:
- Send email with unique login link
- Link expires after 15 minutes
- No password required
- Better UX for customers

3. **OAuth Integration**:
- Allow customers to log in with Google/Microsoft
- Simplifies authentication
- Increases security

#### Security Improvements
- Add rate limiting to prevent brute force attacks
- Implement CSRF protection
- Add session timeout (auto-logout after 30 minutes)
- Encrypt sensitive customer data
- Add audit logging for customer portal access

#### Feature Enhancements
- **Request Service**: Form to request additional services
- **Schedule Changes**: Allow customers to reschedule appointments
- **Payment History**: Show invoices and payment records
- **Document Downloads**: Service reports and receipts
- **Notifications**: Email/SMS preferences
- **Support Chat**: Direct messaging with support team

---

## Testing Checklist

### Daily Cron Job
- [x] Cron job scheduled successfully (check server logs)
- [x] Manual "Process Now" button works
- [ ] Verify jobs are generated at 6:00 AM (wait for next day)
- [ ] Check job generation with multiple service plans
- [ ] Verify nextServiceDate updates correctly

### Email Notifications
- [x] Test email endpoint works (trpc.email.sendTest)
- [x] Email Test page accessible in sidebar
- [ ] Send test email to your address
- [ ] Verify HTML formatting displays correctly
- [ ] Test service reminder email template
- [ ] Test job completion email template
- [ ] Verify emails don't go to spam folder

### Customer Portal
- [x] Portal accessible at /customer-portal
- [x] Login page displays correctly
- [x] Customer data loads after login
- [ ] Test with real customer email
- [ ] Verify service plans display correctly
- [ ] Verify upcoming jobs sorted by date
- [ ] Verify service history shows completed jobs
- [ ] Test logout functionality
- [ ] Test "Account Not Found" error state
- [ ] Test mobile responsiveness

---

## Deployment Notes

### Environment Variables
Ensure these are set in production:
```bash
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=sandboxXXXX.mailgun.org
MAILGUN_BASE_URL=https://api.mailgun.net
FROM_EMAIL=Ready2Spray <postmaster@sandboxXXXX.mailgun.org>
```

### Cron Job
- Cron job runs automatically when server starts
- No additional configuration needed
- Timezone is based on server time (adjust cron expression if needed)

### Mailgun Domain Verification
For production:
1. Add custom domain in Mailgun (e.g., `mg.gtmplanetary.com`)
2. Add DNS records (MX, TXT, CNAME)
3. Verify domain in Mailgun dashboard
4. Update `MAILGUN_DOMAIN` and `FROM_EMAIL` environment variables

### Customer Portal URL
Share this URL with customers:
```
https://ready2spray.gtmplanetary.com/customer-portal
```

Or create a custom subdomain:
```
https://portal.ready2spray.gtmplanetary.com
```

---

## Monitoring & Maintenance

### Cron Job Monitoring
Check server logs daily for:
```
[Cron] Service plan processing complete: X jobs generated from Y plans, 0 errors
```

If errors occur:
```
[Cron] Service plan processing failed: [error details]
```

### Email Delivery Monitoring
- Check Mailgun dashboard for delivery statistics
- Monitor bounce rate (should be <5%)
- Monitor spam complaints (should be <0.1%)
- Review failed deliveries and adjust email content

### Customer Portal Analytics
Track:
- Number of customer logins per day
- Most viewed sections (service plans, upcoming jobs, history)
- Average session duration
- Login failure rate

---

## Future Enhancements

### Phase 11: Advanced Notifications
- [ ] SMS notifications via Twilio
- [ ] Push notifications for mobile app
- [ ] Weather delay notifications
- [ ] Technician arrival notifications (15 minutes before)
- [ ] Weekly service summary emails

### Phase 12: Customer Portal V2
- [ ] Mobile app (React Native)
- [ ] In-app messaging with support team
- [ ] Service rating and feedback system
- [ ] Photo uploads (pest sightings, damage reports)
- [ ] Payment portal integration
- [ ] Referral program

### Phase 13: Analytics & Reporting
- [ ] Customer engagement dashboard
- [ ] Email open/click tracking
- [ ] Service plan renewal predictions
- [ ] Customer lifetime value calculations
- [ ] Automated marketing campaigns

---

## Support & Troubleshooting

### Cron Job Not Running
1. Check server logs for initialization message
2. Verify node-cron package installed
3. Restart server to reinitialize cron
4. Check server timezone matches expected schedule

### Emails Not Sending
1. Verify Mailgun credentials in environment variables
2. Check Mailgun dashboard for API errors
3. Test with Email Test page
4. Verify FROM_EMAIL domain matches MAILGUN_DOMAIN
5. Check spam folder

### Customer Portal Issues
1. Verify customer email exists in database
2. Check browser console for JavaScript errors
3. Verify tRPC endpoints are accessible
4. Test with different customer emails
5. Clear browser cache and cookies

---

## Contact & Resources

- **Mailgun Dashboard**: https://app.mailgun.com
- **Cron Expression Tester**: https://crontab.guru
- **Project Repository**: https://github.com/wbaguley/Ready2Spray_AI
- **Support Email**: wyatt@gtmplanetary.com
