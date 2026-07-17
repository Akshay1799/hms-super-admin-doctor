import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(`[${req.method}] ${req.path} — ${err.message}`, {
    stack: err.stack,
    ip: req.ip,
  });

  // Our custom errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Zod validation errors (shouldn't reach here if using validate middleware, but just in case)
  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', 400, err.errors);
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    sendError(res, messages.join(', '), 400);
    return;
  }

  // Mongoose duplicate key (e.g. unique email)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    sendError(res, `${field} already exists`, 409);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
    return;
  }

  // Unknown errors
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  sendError(res, message, 500);
}

// 404 handler — must be registered before errorHandler
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
}
