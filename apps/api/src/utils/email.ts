import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

// Create transporter only if SMTP is configured
const transporter = env.smtp.enabled
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!transporter) {
    logger.warn(`📧 Email not sent (SMTP not configured). Would have sent to: ${options.to}`);
    logger.warn(`   Subject: ${options.subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"${env.smtp.fromName}" <${env.smtp.from}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  logger.info(`📧 Email sent to ${options.to}: ${options.subject}`);
}

// ── Email Templates ───────────────────────────────────────────

export async function sendDoctorInvitationEmail(options: {
  to: string;
  name: string;
  invitationToken: string;
  portalUrl: string;
  role?: string;
}): Promise<void> {
  const activationLink = `${options.portalUrl}/activate-account?token=${options.invitationToken}`;
  const roleLabel = options.role === 'HOSPITAL_ADMIN'
    ? 'Hospital Administrator'
    : options.role === 'DEPT_ADMIN'
    ? 'Department Administrator'
    : 'Doctor';

  await sendEmail({
    to: options.to,
    subject: `You've been invited to MediChain HMS as ${roleLabel}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #0ea5e9; margin-bottom: 8px;">MediChain HMS</h1>
          <h2 style="color: #1e293b; margin-bottom: 24px;">Welcome, ${options.name}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            You have been invited to join MediChain Hospital Management System as a <strong>${roleLabel}</strong>.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Click the button below to activate your account and set your password. 
            This link expires in <strong>72 hours</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationLink}" 
               style="background: #0ea5e9; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Activate Account
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            Or copy this link: <a href="${activationLink}" style="color: #0ea5e9;">${activationLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to MediChain HMS! Activate your account at: ${activationLink}`,
  });
}

export async function sendPasswordResetEmail(options: {
  to: string;
  name: string;
  resetToken: string;
  portalUrl: string;
}): Promise<void> {
  const resetLink = `${options.portalUrl}/reset-password?token=${options.resetToken}`;

  await sendEmail({
    to: options.to,
    subject: 'Reset your MediChain HMS password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #0ea5e9; margin-bottom: 8px;">MediChain HMS</h1>
          <h2 style="color: #1e293b; margin-bottom: 24px;">Password Reset Request</h2>
          <p style="color: #475569; line-height: 1.6;">
            Hi ${options.name}, we received a request to reset your password.
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="background: #0ea5e9; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            Or copy this link: <a href="${resetLink}" style="color: #0ea5e9;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Reset your MediChain HMS password at: ${resetLink}`,
  });
}
