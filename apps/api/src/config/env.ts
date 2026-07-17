import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  mongoUri: requireEnv('MONGODB_URI'),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'hms_access_secret_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'hms_refresh_secret_dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  frontends: {
    superAdmin: process.env.SUPER_ADMIN_URL || 'http://localhost:3001',
    doctorPortal: process.env.DOCTOR_PORTAL_URL || 'http://localhost:3000',
    hospitalAdmin: process.env.HOSPITAL_ADMIN_URL || 'http://localhost:3002',
    patientPortal: process.env.PATIENT_PORTAL_URL || 'http://localhost:3003',
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
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};
