import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import tenantRoutes from './routes/tenants.routes';
import hospitalRoutes from './routes/hospitals.routes';
import departmentRoutes from './routes/departments.routes';
import userRoutes from './routes/users.routes';
import patientRoutes from './routes/patients.routes';
import appointmentRoutes from './routes/appointments.routes';
import billingRoutes from './routes/billing.routes';
import auditRoutes from './routes/audit.routes';
import dashboardRoutes from './routes/dashboard.routes';
import rosterRoutes from './routes/rosters.routes';
import checkoutRoutes from './routes/checkout.routes';

const app = express();

// Standard middleware
app.use(helmet());

// CORS configuration supporting all frontends
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const deployedDoctorPortalOrigin = 'https://hms-super-admin-doctor-doctor-porta.vercel.app';

const allowedOrigins = [...new Set([
  env.frontends.superAdmin,
  env.frontends.doctorPortal,
  env.frontends.hospitalAdmin,
  env.frontends.patientPortal,
  deployedDoctorPortalOrigin,
  ...configuredOrigins,
])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or if it matches allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// Rate limiting (prevent abuse)
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    env: env.nodeEnv,
  });
});

// Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/checkout', checkoutRoutes);

// 404 & Global error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
