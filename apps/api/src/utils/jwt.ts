import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { JwtPayload } from '../middleware/authenticate';
import { IUser } from '../models/User';

// Each portal uses its own isolated cookie name to prevent
// shared-cookie collisions when running on the same localhost domain.
export const PORTAL_COOKIE_NAMES = {
  SUPER_ADMIN:    'hms_sa_token',
  TENANT_ADMIN:   'hms_ta_token', 
  HOSPITAL_ADMIN: 'hms_ha_token',
  DEPT_ADMIN:     'hms_ha_token', // shares hospital-admin panel
  DOCTOR:         'hms_dr_token',
  NURSE:          'hms_dr_token', // shares doctor portal
  PATIENT:        'hms_pt_token',
  RECEPTIONIST:   'hms_ha_token',
  STAFF:          'hms_ha_token',
} as const;

// Map X-Portal-Type header value → cookie name
export const PORTAL_HEADER_COOKIE_MAP: Record<string, string> = {
  'SUPER_ADMIN':    'hms_sa_token',
  'TENANT_ADMIN':   'hms_ta_token',
  'HOSPITAL_ADMIN': 'hms_ha_token',
  'DOCTOR':         'hms_dr_token',
  'PATIENT':        'hms_pt_token',
};

export function getPortalCookieName(role: string): string {
  return (PORTAL_COOKIE_NAMES as Record<string, string>)[role] ?? 'accessToken';
}

export function generateAccessToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    tenantId: user.tenantId?.toString() ?? null,
    hospitalId: user.hospitalId?.toString() ?? null,
    departmentId: user.departmentId?.toString() ?? null,
  };

  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateInvitationToken(userId: string, email: string, name?: string): { token: string; hash: string } {
  const token = jwt.sign(
    { userId, doctorId: userId, email, name: name || 'User', type: 'invitation' },
    env.jwt.accessSecret,
    { expiresIn: '72h' }
  );
  const hash = hashToken(token);
  return { token, hash };
}

export function verifyInvitationToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as { userId: string; email: string; type: string };
    if (payload.type !== 'invitation') return null;
    return payload;
  } catch {
    return null;
  }
}

export function generatePasswordResetToken(userId: string): { token: string; hash: string } {
  const token = jwt.sign(
    { userId, type: 'password-reset' },
    env.jwt.accessSecret,
    { expiresIn: '1h' }
  );
  const hash = hashToken(token);
  return { token, hash };
}

export function verifyPasswordResetToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as { userId: string; type: string };
    if (payload.type !== 'password-reset') return null;
    return payload;
  } catch {
    return null;
  }
}

// Cookie options — accepts an explicit cookie name for per-portal isolation
export function getAccessTokenCookieOptions(cookieName?: string) {
  void cookieName; // name is used externally by caller, kept for discoverability
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  };
}

// Cookie options for refresh token
export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

// Clear cookie options (for logout)
export function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: '/',
  };
}
