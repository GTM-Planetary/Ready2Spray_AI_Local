/**
 * Email Service Module
 * Handles all email notifications using Mailgun
 */

import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net',
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';

/**
 * Send service reminder email to customer
 * Sent 24 hours before scheduled service
 */
export async function sendServiceReminderEmail(params: {
  customerEmail: string;
  customerName: string;
  jobTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  siteAddress: string;
  targetPests?: string;
  notes?: string;
}) {
  const {
    customerEmail,
    customerName,
    jobTitle,
    scheduledDate,
    scheduledTime,
    siteAddress,
    targetPests,
    notes,
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #10b981; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #6b7280; margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚁 Service Reminder</h1>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>This is a friendly reminder that your scheduled pest control service is coming up tomorrow.</p>
          
          <div class="detail-row">
            <div class="detail-label">Service:</div>
            <div class="detail-value">${jobTitle}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${scheduledDate}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${scheduledTime}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">${siteAddress}</div>
          </div>
          
          ${targetPests ? `
          <div class="detail-row">
            <div class="detail-label">Target Pests:</div>
            <div class="detail-value">${targetPests}</div>
          </div>
          ` : ''}
          
          ${notes ? `
          <div class="detail-row">
            <div class="detail-label">Notes:</div>
            <div class="detail-value">${notes}</div>
          </div>
          ` : ''}
          
          <p style="margin-top: 30px;">If you need to reschedule or have any questions, please contact us as soon as possible.</p>
          
          <p>Thank you for choosing Ready2Spray!</p>
        </div>
        <div class="footer">
          <p>Ready2Spray by GTM Planetary<br>
          Professional Aerial Pest Control Services</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await mg.messages.create(DOMAIN, {
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: `Service Reminder: ${jobTitle} - Tomorrow`,
      html: htmlContent,
      text: `Hello ${customerName},\n\nThis is a reminder that your ${jobTitle} is scheduled for tomorrow (${scheduledDate} at ${scheduledTime}).\n\nLocation: ${siteAddress}\n${targetPests ? `Target Pests: ${targetPests}\n` : ''}${notes ? `Notes: ${notes}\n` : ''}\n\nThank you for choosing Ready2Spray!`,
    });

    console.log('[Email] Service reminder sent successfully:', result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('[Email] Failed to send service reminder:', error);
    return { success: false, error };
  }
}

/**
 * Send job completion confirmation email to customer
 */
export async function sendJobCompletionEmail(params: {
  customerEmail: string;
  customerName: string;
  jobTitle: string;
  completedDate: string;
  siteAddress: string;
  targetPests?: string;
  applicationDetails?: string;
  personnelName?: string;
  nextServiceDate?: string;
}) {
  const {
    customerEmail,
    customerName,
    jobTitle,
    completedDate,
    siteAddress,
    targetPests,
    applicationDetails,
    personnelName,
    nextServiceDate,
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #10b981; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #6b7280; margin-top: 5px; }
        .success-badge { display: inline-block; padding: 8px 16px; background: #d1fae5; color: #065f46; border-radius: 20px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Service Complete</h1>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>Your pest control service has been completed successfully!</p>
          
          <div class="success-badge">✓ Service Completed</div>
          
          <div class="detail-row">
            <div class="detail-label">Service:</div>
            <div class="detail-value">${jobTitle}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Completed:</div>
            <div class="detail-value">${completedDate}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">${siteAddress}</div>
          </div>
          
          ${personnelName ? `
          <div class="detail-row">
            <div class="detail-label">Technician:</div>
            <div class="detail-value">${personnelName}</div>
          </div>
          ` : ''}
          
          ${targetPests ? `
          <div class="detail-row">
            <div class="detail-label">Target Pests:</div>
            <div class="detail-value">${targetPests}</div>
          </div>
          ` : ''}
          
          ${applicationDetails ? `
          <div class="detail-row">
            <div class="detail-label">Application Details:</div>
            <div class="detail-value">${applicationDetails}</div>
          </div>
          ` : ''}
          
          ${nextServiceDate ? `
          <div class="detail-row">
            <div class="detail-label">Next Scheduled Service:</div>
            <div class="detail-value">${nextServiceDate}</div>
          </div>
          ` : ''}
          
          <p style="margin-top: 30px;">If you have any questions or concerns about the service, please don't hesitate to contact us.</p>
          
          <p>Thank you for choosing Ready2Spray!</p>
        </div>
        <div class="footer">
          <p>Ready2Spray by GTM Planetary<br>
          Professional Aerial Pest Control Services</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await mg.messages.create(DOMAIN, {
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: `Service Complete: ${jobTitle}`,
      html: htmlContent,
      text: `Hello ${customerName},\n\nYour ${jobTitle} has been completed successfully!\n\nCompleted: ${completedDate}\nLocation: ${siteAddress}\n${personnelName ? `Technician: ${personnelName}\n` : ''}${targetPests ? `Target Pests: ${targetPests}\n` : ''}${applicationDetails ? `Application Details: ${applicationDetails}\n` : ''}${nextServiceDate ? `Next Service: ${nextServiceDate}\n` : ''}\n\nThank you for choosing Ready2Spray!`,
    });

    console.log('[Email] Job completion email sent successfully:', result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('[Email] Failed to send job completion email:', error);
    return { success: false, error };
  }
}

/**
 * Send test email to verify Mailgun configuration
 */
export async function sendTestEmail(toEmail: string) {
  try {
    const result = await mg.messages.create(DOMAIN, {
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Ready2Spray Email Service - Test',
      html: '<h1>✅ Email Service Working!</h1><p>Your Mailgun integration is configured correctly.</p>',
      text: 'Email Service Working! Your Mailgun integration is configured correctly.',
    });

    console.log('[Email] Test email sent successfully:', result);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('[Email] Failed to send test email:', error);
    return { success: false, error };
  }
}
