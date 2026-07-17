import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { UnauthorizedError } from '../utils/response';
import { PORTAL_HEADER_COOKIE_MAP } from '../utils/jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenantId?: string;
    }
  }
}

export interface JwtPayload {
  userId: string;
  role: string;
  tenantId: string | null;
  hospitalId: string | null;
  departmentId: string | null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    // Determine the correct per-portal cookie name from the X-Portal-Type header.
    // Each frontend portal sends this header to identify itself, allowing the
    // backend to read that portal's isolated httpOnly cookie — preventing
    // shared-cookie collisions on localhost without needing subdomains.
    const portalType = req.headers['x-portal-type'] as string | undefined;
    const portalCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : null;

    const token =
      // 1. Try Authorization header (highest priority — used by hospital-admin localStorage workaround)
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null) ||
      // 2. Try the portal-specific cookie if X-Portal-Type was provided
      (portalCookieName ? req.cookies?.[portalCookieName] : null) ||
      // 3. Fall back to legacy shared cookie (backwards compat / dev)
      req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status === 'Suspended') {
      throw new UnauthorizedError('Account suspended');
    }

    if (user.status === 'Inactive') {
      throw new UnauthorizedError('Account inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
}

// Optional auth — doesn't throw if no token, just skips user attachment
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const portalType = req.headers['x-portal-type'] as string | undefined;
    const portalCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : null;

    const token =
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null) ||
      (portalCookieName ? req.cookies?.[portalCookieName] : null) ||
      req.cookies?.accessToken;

    if (!token) return next();

    const payload = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
    const user = await User.findById(payload.userId).select('-password');
    if (user) req.user = user;
  } catch {
    // silently ignore — token may be expired
  }
  next();
}
