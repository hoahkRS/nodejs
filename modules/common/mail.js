"use strict";
const sgMail = require("@sendgrid/mail");

const API_KEY = process.env.SENDGRID_API_KEY || "";

if (API_KEY) {
  try {
    sgMail.setApiKey(API_KEY);
  } catch (e) {
    console.warn(
      "SendGrid API key invalid or not set properly. Emails may fail."
    );
  }
} else {
  console.warn(
    "SENDGRID_API_KEY not set. Email sending will fail until configured."
  );
}

const DEFAULT_FROM = process.env.SENDGRID_FROM || "no-reply@example.com";

/**
 * Send an email via SendGrid.
 * @param {{ to: string|string[], subject: string, text?: string, html?: string, from?: string }} options
 * @returns {Promise<{success?: boolean, skipped?: boolean}>}
 */
async function sendMail({ to, subject, text, html, from }) {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, skipped: true };
  }
  if (!API_KEY) {
    const err = new Error("MAIL_NOT_CONFIGURED");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }
  const msg = {
    to,
    from: from || DEFAULT_FROM,
    subject,
    // If html provided, text can be omitted; SendGrid can generate plain text
    ...(text ? { text } : {}),
    ...(html ? { html } : {}),
  };

  await sgMail.send(msg);
  return { success: true };
}

module.exports = {
  sendMail,
};
