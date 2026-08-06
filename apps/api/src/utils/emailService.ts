import nodemailer from 'nodemailer';

// IMPORTANT: Replace these dummy credentials with real SMTP credentials
// Host: smtp.yourhospital.com or smtp.gmail.com etc.
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io', // Dummy host
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || 'dummy_user',
    pass: process.env.SMTP_PASS || 'dummy_password',
  },
};

const transporter = nodemailer.createTransport(SMTP_CONFIG);

export async function sendEmail(to: string, subject: string, html: string, attachments?: any[]) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'reports@medichain.com',
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Sent email to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error);
    throw new Error('Email dispatch failed');
  }
}
