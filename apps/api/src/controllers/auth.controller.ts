import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { RefreshToken, Invitation, PasswordReset } from '../models/AuthToken';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateInvitationToken,
  verifyInvitationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
  getPortalCookieName,
  PORTAL_HEADER_COOKIE_MAP,
} from '../utils/jwt';
import { sendSuccess, sendCreated, AppError, UnauthorizedError, NotFoundError } from '../utils/response';
import { sendDoctorInvitationEmail, sendPasswordResetEmail } from '../utils/email';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ── Login ─────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user with password (password field is excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'Suspended') throw new AppError('Your account has been suspended. Contact support.', 403);
    if (user.status === 'Inactive') throw new AppError('Account is inactive.', 403);
    if (user.status === 'Pending') throw new AppError('Please activate your account first.', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();

    // Store refresh token hash in DB
    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    // Derive the portal-specific cookie name from the request header or the user's role.
    // This prevents shared-cookie collisions when all portals run on localhost,
    // even if a SUPER_ADMIN logs into a portal like hospital-admin.
    const portalType = req.headers['x-portal-type'] as string | undefined;
    const accessCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : getPortalCookieName(user.role);
    const refreshCookieName = accessCookieName + '_refresh';

    // Set per-portal isolated httpOnly cookies
    res.cookie(accessCookieName, accessToken, getAccessTokenCookieOptions());
    res.cookie(refreshCookieName, refreshToken, getRefreshTokenCookieOptions());

    // Remove password from response
    const userObj = user.toJSON();

    logger.info(`User logged in: ${user.email} (${user.role})`);

    sendSuccess(res, { user: userObj, accessToken, cookieName: accessCookieName }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

// ── Refresh Token ─────────────────────────────────────────────
export async function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const portalType = req.headers['x-portal-type'] as string | undefined;
    const accessCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : 'accessToken';
    const refreshCookieName = accessCookieName === 'accessToken' ? 'refreshToken' : accessCookieName + '_refresh';

    const refreshToken = req.cookies?.[refreshCookieName] || req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedError('Refresh token required');

    const tokenHash = hashToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) throw new UnauthorizedError('Invalid or expired refresh token');

    const user = await User.findById(storedToken.userId);
    if (!user || user.status !== 'Active') {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Rotate refresh token — delete old, create new
    await RefreshToken.deleteOne({ _id: storedToken._id });

    const accessToken = generateAccessToken(user);
    const { token: newRefreshToken, hash: newRefreshTokenHash } = generateRefreshToken();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    // Use the same portal-specific cookie names as resolved above
    const activeAccessCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : getPortalCookieName(user.role);
    const activeRefreshCookieName = activeAccessCookieName + '_refresh';

    res.cookie(activeAccessCookieName, accessToken, getAccessTokenCookieOptions());
    res.cookie(activeRefreshCookieName, newRefreshToken, getRefreshTokenCookieOptions());

    sendSuccess(res, { user: user.toJSON() }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Determine which portal cookie to clear via X-Portal-Type header
    const portalType = req.headers['x-portal-type'] as string | undefined;
    const accessCookieName = portalType && PORTAL_HEADER_COOKIE_MAP[portalType]
      ? PORTAL_HEADER_COOKIE_MAP[portalType]
      : (req.user ? getPortalCookieName(req.user.role) : 'accessToken');
    const refreshCookieName = accessCookieName + '_refresh';

    const refreshToken = req.cookies?.[refreshCookieName] ?? req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.deleteOne({ tokenHash });
    }

    res.clearCookie(accessCookieName, getClearCookieOptions());
    res.clearCookie(refreshCookieName, getClearCookieOptions());
    // Also clear legacy cookie names for backwards compatibility
    res.clearCookie('accessToken', getClearCookieOptions());
    res.clearCookie('refreshToken', getClearCookieOptions());

    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

// ── Get Current User ─────────────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, req.user, 'User info');
  } catch (err) {
    next(err);
  }
}

// ── Forgot Password ──────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, portalType } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success (don't reveal if email exists)
    if (!user) {
      sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
      return;
    }

    // Invalidate any existing reset tokens
    await PasswordReset.deleteMany({ userId: user._id });

    const { token, hash } = generatePasswordResetToken(user._id.toString());

    await PasswordReset.create({
      userId: user._id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Determine which portal the reset link should go to
    const portalUrl = portalType === 'doctor'
      ? env.frontends.doctorPortal
      : portalType === 'hospital-admin'
      ? env.frontends.hospitalAdmin
      : env.frontends.superAdmin;

    setImmediate(() => {
      sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetToken: token,
        portalUrl,
      }).catch((mailErr: any) => {
        console.warn(`📧 Failed to send password reset email to ${user.email}:`, mailErr?.message || mailErr);
      });
    });

    sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
}

// ── Reset Password ────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    const payload = verifyPasswordResetToken(token);
    if (!payload) throw new AppError('Invalid or expired reset token', 400);

    const tokenHash = hashToken(token);
    const storedToken = await PasswordReset.findOne({
      tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) throw new AppError('Reset token has already been used or expired', 400);

    const user = await User.findById(payload.userId);
    if (!user) throw new NotFoundError('User not found');

    user.password = password;
    await user.save(); // pre-save hook will hash it

    storedToken.isUsed = true;
    await storedToken.save();

    // Revoke all refresh tokens (security: force re-login everywhere)
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
  } catch (err) {
    next(err);
  }
}

// ── Activate Account (Doctor / Admin Invitation) ──────────────
export async function activateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    const payload = verifyInvitationToken(token);
    if (!payload) throw new AppError('Invalid or expired invitation token', 400);

    const tokenHash = hashToken(token);
    const invitation = await Invitation.findOne({
      tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) throw new AppError('Invitation has already been used or expired', 400);

    const user = await User.findById(invitation.userId);
    if (!user) throw new NotFoundError('User record not found. Contact your administrator.');

    if (user.status !== 'Pending') {
      throw new AppError('Account is already activated', 400);
    }

    user.password = password;
    user.status = 'Active';
    await user.save();

    invitation.isUsed = true;
    await invitation.save();

    logger.info(`Account activated: ${user.email} (${user.role})`);

    sendSuccess(res, null, 'Account activated successfully. You can now login.');
  } catch (err) {
    next(err);
  }
}
