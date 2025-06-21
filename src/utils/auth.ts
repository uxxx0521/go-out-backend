// src/utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 12; // Higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Promise<boolean> - True if passwords match
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Generate a JWT token for business authentication
 * @param businessId - Business ID to include in token
 * @returns string - JWT token
 */
export const generateBusinessToken = (businessId: string): string => {
  try {
    const payload = {
      businessId,
      type: 'business',
      issuedAt: Date.now()
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

    const options: jwt.SignOptions = {
      expiresIn,
      issuer: 'go-out-loyalty',
      audience: 'business'
    };

    const token = jwt.sign(payload, secret, options);

    return token;
  } catch (error) {
    console.error('❌ Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Generate a JWT token for customer authentication
 * @param customerId - Customer ID to include in token
 * @param businessId - Business ID the customer belongs to
 * @returns string - JWT token
 */
export const generateCustomerToken = (customerId: string, businessId: string): string => {
  try {
    const payload = {
      customerId,
      businessId,
      type: 'customer',
      issuedAt: Date.now()
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

    const options: jwt.SignOptions = {
      expiresIn,
      issuer: 'go-out-loyalty',
      audience: 'customer'
    };

    const token = jwt.sign(payload, secret, options);

    return token;
  } catch (error) {
    console.error('❌ Customer token generation error:', error);
    throw new Error('Failed to generate customer authentication token');
  }
};

/**
 * Generate a short-lived QR token for stamp collection
 * @param businessId - Business ID
 * @param stampsValue - Number of stamps to award
 * @returns string - QR token
 */
export const generateQrToken = (businessId: string, stampsValue: number): string => {
  try {
    const qrId = generateUniqueId();
    const expiresAt = Date.now() + (30 * 1000); // 30 seconds expiration

    const payload = {
      businessId,
      stampsValue,
      qrId,
      type: 'qr',
      issuedAt: Date.now(),
      expiresAt
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const options: jwt.SignOptions = {
      expiresIn: '30s',
      issuer: 'go-out-loyalty',
      audience: 'qr-scan'
    };

    const token = jwt.sign(payload, secret, options);

    return token;
  } catch (error) {
    console.error('❌ QR token generation error:', error);
    throw new Error('Failed to generate QR token');
  }
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns any - Decoded token payload
 */
export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    console.error('❌ Token verification error:', error);
    throw new Error('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns string | null - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }
  
  return null;
};

/**
 * Generate a unique ID for QR codes
 * @returns string - Unique identifier
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
};

/**
 * Generate a secure random token for password resets, email verification, etc.
 * @param length - Length of the token (default: 32)
 * @returns string - Random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Check if a token is expired
 * @param token - JWT token to check
 * @returns boolean - True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param token - JWT token
 * @returns Date | null - Expiration date or null if invalid
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Sanitize and validate email address
 * @param email - Email address to sanitize
 * @returns string - Sanitized email
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Generate password reset token
 * @param businessId - Business ID
 * @returns string - Password reset token
 */
export const generatePasswordResetToken = (businessId: string): string => {
  try {
    const payload = {
      businessId,
      type: 'password_reset',
      issuedAt: Date.now()
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const options: jwt.SignOptions = {
      expiresIn: '1h', // 1 hour expiration for password reset
      issuer: 'go-out-loyalty',
      audience: 'password-reset'
    };

    const token = jwt.sign(payload, secret, options);

    return token;
  } catch (error) {
    console.error('❌ Password reset token generation error:', error);
    throw new Error('Failed to generate password reset token');
  }
};

/**
 * Generate email verification token
 * @param businessId - Business ID
 * @returns string - Email verification token
 */
export const generateEmailVerificationToken = (businessId: string): string => {
  try {
    const payload = {
      businessId,
      type: 'email_verification',
      issuedAt: Date.now()
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const options: jwt.SignOptions = {
      expiresIn: '24h', // 24 hours for email verification
      issuer: 'go-out-loyalty',
      audience: 'email-verification'
    };

    const token = jwt.sign(payload, secret, options);

    return token;
  } catch (error) {
    console.error('❌ Email verification token generation error:', error);
    throw new Error('Failed to generate email verification token');
  }
};

// Type definitions for token payloads
export interface BusinessTokenPayload {
  businessId: string;
  type: 'business';
  issuedAt: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface CustomerTokenPayload {
  customerId: string;
  businessId: string;
  type: 'customer';
  issuedAt: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface QrTokenPayload {
  businessId: string;
  stampsValue: number;
  qrId: string;
  type: 'qr';
  issuedAt: number;
  expiresAt: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}