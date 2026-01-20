# Task: Build Customer Self-Service Portal

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: High
## Files to Create: New routes, pages, components

---

## Overview

Create a customer-facing portal where clients can:
- View their scheduled and completed jobs
- Request new services
- View and pay invoices
- Access documents and reports
- Update their contact information

---

## Requirements

1. Separate customer login (magic link or password)
2. Customer dashboard with job overview
3. Service request form
4. Invoice viewing and payment
5. Document downloads (reports, certificates)
6. Contact/profile management

---

## Implementation Outline

### Routes

```
/portal                    - Customer dashboard
/portal/jobs               - Job list and details
/portal/jobs/:id           - Individual job details
/portal/requests           - Service request form
/portal/invoices           - Invoice list
/portal/invoices/:id       - Invoice details + pay
/portal/documents          - Documents/reports
/portal/settings           - Profile settings
```

### Database Changes

```typescript
// Customer portal access
export const customerPortalAccess = pgTable('customer_portal_access', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  magicLinkToken: varchar('magic_link_token', { length: 255 }),
  magicLinkExpires: timestamp('magic_link_expires'),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Service requests
export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  requestType: varchar('request_type', { length: 50 }).notNull(),
  description: text('description'),
  preferredDate: date('preferred_date'),
  status: varchar('status', { length: 20 }).default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
});
```

### Key Components

1. **PortalLayout** - Simplified navigation for customers
2. **JobCard** - Customer-friendly job view
3. **ServiceRequestForm** - Request new services
4. **InvoiceViewer** - View and pay invoices
5. **DocumentList** - Download reports/certificates

### API Endpoints

```typescript
// Customer portal routes
customerRouter.get('/portal/jobs')           // Get customer's jobs
customerRouter.get('/portal/jobs/:id')       // Get job details
customerRouter.post('/portal/requests')      // Submit service request
customerRouter.get('/portal/invoices')       // Get invoices
customerRouter.post('/portal/pay')           // Process payment
customerRouter.get('/portal/documents')      // List documents
customerRouter.get('/portal/documents/:id')  // Download document
```

---

## Acceptance Criteria

- [ ] Customers can log in via magic link
- [ ] Dashboard shows upcoming and past jobs
- [ ] Customers can request new services
- [ ] Invoices viewable with payment option
- [ ] Documents downloadable
- [ ] Profile information editable
- [ ] Mobile-responsive design

---

## Notes for Aider

This is a significant new feature. Consider:
1. Start with read-only features (view jobs, invoices)
2. Add service requests
3. Add payment processing
4. Add document management

Use existing Stripe integration for payments.
