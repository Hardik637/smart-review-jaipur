import nodemailer from "nodemailer";

/**
 * Real Email Dispatch Service
 * Uses Hostinger SMTP (noreply@welurik.com) or fallback providers.
 */
async function getMailTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpFrom = process.env.SMTP_FROM || `"SmartReview" <noreply@smartreview.app>`;

  let transporter: nodemailer.Transporter;
  let isEthereal = false;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    isEthereal = true;
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return { transporter, smtpFrom, isEthereal };
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
  businessName = "Your Business",
}: {
  to: string;
  resetLink: string;
  businessName?: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const { transporter, smtpFrom, isEthereal } = await getMailTransporter();

    // High-converting Apple/Linear-styled HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
          .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; display: inline-block; }
          .badge { display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(15,23,42,0.2); }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5; }
          .link-fallback { word-break: break-all; color: #6366f1; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">S <span style="color:#cbd5e1; font-weight:300;">|</span> SmartReview</div>
          <div class="badge">Security Notification</div>
          <h1>Password Reset Request</h1>
          <p>Hello,</p>
          <p>We received a request to reset the password for your business account associated with <strong>${to}</strong>. Click the button below to set a new password:</p>
          
          <div class="btn-container">
            <a href="${resetLink}" target="_blank" class="btn">Reset My Password</a>
          </div>

          <p>This confirmation link is valid for <strong>1 hour</strong>. If you did not request this, you can safely ignore this email and your password will remain unchanged.</p>
          
          <div class="footer">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetLink}" class="link-fallback">${resetLink}</a></p>
            <p style="margin-top: 16px;">© 2026 SmartReview • 100% Google Policy Compliant Review Assistant</p>
          </div>
        </div>
      </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Reset your SmartReview account password`,
      text: `Reset your password by opening this link in your browser: ${resetLink} (Valid for 1 hour)`,
      html: htmlContent,
    });

    let previewUrl: string | undefined;
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log("==================================================");
      console.log(`[ETHEREAL LIVE EMAIL SENT] To: ${to}`);
      console.log(`[VIEW EMAIL ONLINE]: ${previewUrl}`);
      console.log("==================================================");
    } else {
      console.log(`[LIVE EMAIL DELIVERED] To: ${to} (MessageId: ${info.messageId})`);
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error("Failed to send reset email:", err);
    return { success: false, error: err.message };
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dispatch instant alert email to business owner when a customer leaves private negative feedback
 */
export async function sendFeedbackNotificationEmail({
  to,
  businessName,
  customerName,
  customerPhone,
  customerEmail,
  message,
  issueTopics = [],
  dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/feedback`,
}: {
  to: string;
  businessName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  message: string;
  issueTopics?: string[];
  dashboardLink?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { transporter, smtpFrom } = await getMailTransporter();

    const safeBusinessName = escapeHtml(businessName || "Your Business");
    const safeCustomerName = customerName ? escapeHtml(customerName) : "Anonymous Customer";
    const safeCustomerPhone = customerPhone ? escapeHtml(customerPhone) : null;
    const safeCustomerEmail = customerEmail ? escapeHtml(customerEmail) : null;
    const safeMessage = escapeHtml(message || "");
    const safeIssues = Array.isArray(issueTopics) ? issueTopics.map(t => escapeHtml(String(t))) : [];

    const topicsBadges = safeIssues.length > 0
      ? safeIssues.map(t => `<span style="display:inline-block; padding: 4px 10px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; border-radius:9999px; font-size:12px; margin-right:6px; margin-bottom:6px; font-weight:600;">${t}</span>`).join(" ")
      : "<em style='color:#94a3b8; font-size:13px;'>None specified</em>";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 16px; color: #0f172a; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
          .logo { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px; display: inline-block; }
          .alert-badge { display: inline-block; padding: 4px 12px; background: #fff1f2; border: 1px solid #ffe4e6; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #e11d48; margin-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
          .feedback-box { background: #f8fafc; border-left: 4px solid #f43f5e; padding: 16px 20px; border-radius: 8px; margin: 20px 0; font-style: italic; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .meta-table td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .meta-table td.label { font-weight: 600; color: #64748b; width: 35%; }
          .meta-table td.value { color: #0f172a; font-weight: 500; }
          .btn-container { text-align: center; margin: 30px 0 20px 0; }
          .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 9999px; }
          .shield-note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #15803d; line-height: 1.5; margin-top: 24px; }
          .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">S <span style="color:#cbd5e1; font-weight:300;">|</span> SmartReview</div>
          <div><span class="alert-badge">Private Feedback Alert</span></div>
          <h1>New Customer Feedback for ${safeBusinessName}</h1>
          <p>A customer just submitted private feedback through your review funnel. Because you're using SmartReview, this feedback was intercepted privately and <strong>was NOT posted to Google Maps</strong>.</p>
          
          <div class="feedback-box">
            "${safeMessage}"
          </div>

          <table class="meta-table">
            <tr>
              <td class="label">Customer Name:</td>
              <td class="value">${safeCustomerName}</td>
            </tr>
            ${safeCustomerPhone ? `<tr><td class="label">Phone:</td><td class="value"><a href="tel:${encodeURIComponent(customerPhone!)}" style="color:#2563eb; text-decoration:none;">${safeCustomerPhone}</a></td></tr>` : ""}
            ${safeCustomerEmail ? `<tr><td class="label">Email:</td><td class="value"><a href="mailto:${encodeURIComponent(customerEmail!)}" style="color:#2563eb; text-decoration:none;">${safeCustomerEmail}</a></td></tr>` : ""}
            <tr>
              <td class="label">Issues Highlighted:</td>
              <td class="value">${topicsBadges}</td>
            </tr>
          </table>

          <div class="btn-container">
            <a href="${dashboardLink}" target="_blank" class="btn">View & Resolve in Dashboard →</a>
          </div>

          <div class="shield-note">
            <strong>Google Rating Shielded:</strong> Reaching out to resolve this customer's concern can convert an unhappy customer into a loyal advocate before they leave a public review.
          </div>

          <div class="footer">
            <p>© 2026 SmartReview • Protecting and Growing Local Business Reputations</p>
          </div>
        </div>
      </body>
    </html>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `[Feedback Alert] New Customer Feedback for ${businessName}`,
      text: `A customer submitted feedback for ${businessName}: "${message}". Customer: ${customerName || "Anonymous"} (${customerPhone || customerEmail || "No contact"}). View in dashboard: ${dashboardLink}`,
      html: htmlContent,
    });

    console.log(`[FEEDBACK ALERT DELIVERED] To: ${to} for business: ${businessName}`);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send feedback notification email:", err);
    return { success: false, error: err.message };
  }
}
