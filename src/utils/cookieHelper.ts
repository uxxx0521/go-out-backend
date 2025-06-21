import { Response } from 'express';

export class CookieHelper {
  private static getCookieOptions(rememberMe: boolean = false) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: rememberMe 
        ? 30 * 24 * 60 * 60 * 1000  // 30 days
        : 24 * 60 * 60 * 1000,      // 24 hours
      path: '/',
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    };
  }

  static setAuthCookie(res: Response, token: string, rememberMe: boolean = false): void {
    res.cookie('auth_token', token, this.getCookieOptions(rememberMe));
  }

  static clearAuthCookie(res: Response): void {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      domain: process.env.NODE_ENV === 'production' 
        ? process.env.COOKIE_DOMAIN 
        : undefined
    });
  }
}
// This utility class helps manage authentication cookies in a secure and consistent way.
// It provides methods to set and clear cookies with appropriate options based on the environment.
// The `getCookieOptions` method determines the cookie settings based on whether the user wants to be remembered and the environment (production or development).