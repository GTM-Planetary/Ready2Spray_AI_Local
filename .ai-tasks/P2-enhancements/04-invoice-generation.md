# Task: Add Invoice Generation

## Priority: P2 - ENHANCEMENT
## Estimated Complexity: Medium
## Files to Modify: Create invoice routes, PDF generation

---

## Overview

Add invoice generation capabilities:
- Generate invoices from completed jobs
- PDF invoice generation
- Send invoices via email
- Track payment status
- Stripe payment integration

---

## Requirements

1. Invoice data model with line items
2. PDF invoice generation
3. Email invoice delivery
4. Payment tracking
5. Invoice numbering system
6. Tax calculations

---

## Implementation Outline

### Database Schema

```typescript
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),

  // Amounts
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('draft'), // draft, sent, paid, overdue, cancelled

  // Dates
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),

  // Payment
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),

  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  sentAt: timestamp('sent_at'),
});

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  jobId: uuid('job_id').references(() => jobs.id),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer('sort_order').default(0),
});
```

### PDF Generation

```typescript
// server/lib/pdf.ts

import PDFDocument from 'pdfkit';

export async function generateInvoicePdf(invoice: Invoice, lineItems: LineItem[], org: Organization, customer: Customer): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(20).text(org.name, 50, 50);
    doc.fontSize(10).text(org.address || '');

    // Invoice title
    doc.fontSize(25).text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).text(`#${invoice.invoiceNumber}`, { align: 'right' });

    // Customer info
    doc.fontSize(12).text('Bill To:', 50, 150);
    doc.fontSize(10).text(customer.name);
    doc.text(customer.address || '');

    // Dates
    doc.text(`Issue Date: ${invoice.issueDate}`, 400, 150);
    doc.text(`Due Date: ${invoice.dueDate}`);

    // Line items table
    let y = 250;
    doc.fontSize(10);
    doc.text('Description', 50, y);
    doc.text('Qty', 300, y);
    doc.text('Price', 370, y);
    doc.text('Amount', 450, y, { align: 'right' });

    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    for (const item of lineItems) {
      doc.text(item.description, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`$${item.unitPrice}`, 370, y);
      doc.text(`$${item.amount}`, 450, y, { align: 'right' });
      y += 20;
    }

    // Totals
    y += 20;
    doc.text(`Subtotal: $${invoice.subtotal}`, 400, y, { align: 'right' });
    y += 15;
    doc.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount}`, 400, y, { align: 'right' });
    y += 15;
    doc.fontSize(12).text(`Total: $${invoice.total}`, 400, y, { align: 'right' });

    doc.end();
  });
}
```

### API Endpoints

```typescript
invoiceRouter.post('/invoices')           // Create invoice
invoiceRouter.get('/invoices')            // List invoices
invoiceRouter.get('/invoices/:id')        // Get invoice details
invoiceRouter.put('/invoices/:id')        // Update invoice
invoiceRouter.post('/invoices/:id/send')  // Send to customer
invoiceRouter.get('/invoices/:id/pdf')    // Download PDF
invoiceRouter.post('/invoices/:id/pay')   // Record payment
```

---

## Acceptance Criteria

- [ ] Create invoices from jobs
- [ ] Add/edit line items
- [ ] Generate PDF invoices
- [ ] Send invoices via email
- [ ] Track payment status
- [ ] Sequential invoice numbering
- [ ] Tax calculation

---

## Notes for Aider

Install required packages:
```bash
npm install pdfkit
npm install -D @types/pdfkit
```

Consider using Stripe Invoicing for a more complete solution.
