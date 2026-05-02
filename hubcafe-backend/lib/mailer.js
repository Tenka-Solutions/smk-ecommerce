const nodemailer = require("nodemailer");

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.QUOTE_TO_EMAIL
  );
}

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: ["true", "1", "yes"].includes(
      String(process.env.SMTP_SECURE || "true").toLowerCase()
    ),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[mail] SMTP no configurado; correo omitido", { to, subject });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.QUOTE_FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  createTransporter,
  isSmtpConfigured,
  sendMail,
};
