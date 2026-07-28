import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  isDev: !isProd,
  isProd,

  mongoUri: requireEnv('MONGODB_URI'),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'hms_access_secret_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hms_refresh_secret_dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  frontends: {
    superAdmin: process.env.SUPER_ADMIN_URL || 'https://hms-super-admin-amber.vercel.app',
    doctorPortal: process.env.DOCTOR_PORTAL_URL || 'https://hms-doctor-portal-phi.vercel.app',
    hospitalAdmin: process.env.HOSPITAL_ADMIN_URL || 'https://hms-super-admin-doctor-hospital-adm.vercel.app',
    patientPortal: process.env.PATIENT_PORTAL_URL || 'https://hms-patient-portal-iota.vercel.app',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@medichain.com',
    fromName: process.env.SMTP_FROM_NAME || 'MediChain HMS',
    enabled: !!(process.env.SMTP_HOST && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'CHANGE_ME'),
  },

  cookie: {
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
    sameSite: (process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax')) as 'lax' | 'strict' | 'none',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};
