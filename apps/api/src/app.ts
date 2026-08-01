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
import { apiMetricsMiddleware } from './middleware/apiMetrics.middleware';

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
import doctorRoutes from './routes/doctors.routes';
import walletRoutes from './routes/wallet.routes';
import workflowsRoutes from './routes/workflows.routes';
import ipdRoutes from './routes/ipd.routes';
import tpaRoutes from './routes/tpa.routes';

const app = express();

// Standard middleware
// Standard security middleware configured for multi-domain cross-origin API
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting all frontends in local development & production
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([
  env.frontends.superAdmin,
  env.frontends.doctorPortal,
  env.frontends.hospitalAdmin,
  env.frontends.patientPortal,
  ...configuredOrigins,
])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all localhost and 127.0.0.1 development ports (3000, 3001, 3002, 3003, etc.)
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployment preview and production domains (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow wildcard if configured in environment
      if (process.env.CORS_ALLOWED_ORIGINS === '*') {
        return callback(null, true);
      }

      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Portal-Type',
      'Accept',
      'Origin',
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// Observability and Metrics
app.use(apiMetricsMiddleware);

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
app.use('/api/doctors', doctorRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/tpa', tpaRoutes);

// 404 & Global error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
