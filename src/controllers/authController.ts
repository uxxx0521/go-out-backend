import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { BusinessService } from '../services/businessService';
import { CookieHelper } from '../utils/cookieHelper';
import { AuthRequest } from '../types/auth';

export class AuthController {
  /**
   * Business Signup - Create new business account
   * POST /api/auth/business/signup
   */
  static async businessSignup(req: Request, res: Response): Promise<void> {
    try {
      const signupData = req.body;
      
      // Create business account using service
      const result = await AuthService.createBusinessAccount(signupData);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Type guard: Ensure data exists when success is true
      if (!result.data || !result.data.token || !result.data.business) {
        res.status(500).json({
          success: false,
          error: 'Invalid response from authentication service'
        });
        return;
      }

      // Set secure authentication cookie
      CookieHelper.setAuthCookie(res, result.data.token);

      res.status(201).json({
        success: true,
        message: 'Business account created successfully',
        business: result.data.business
      });
    } catch (error) {
      console.error('❌ Business signup error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create business account' 
      });
    }
  }

  /**
   * Business Signin - Authenticate business
   * POST /api/auth/business/signin
   */
  static async businessSignin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe = false } = req.body;
      
      // Authenticate business using service
      const result = await AuthService.authenticateBusiness(email, password);
      
      if (!result.success) {
        res.status(401).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Type guard: Ensure data exists when success is true
      if (!result.data || !result.data.token || !result.data.business) {
        res.status(500).json({
          success: false,
          error: 'Invalid response from authentication service'
        });
        return;
      }

      // Set secure cookie with appropriate expiration
      CookieHelper.setAuthCookie(res, result.data.token, rememberMe);

      res.json({
        success: true,
        message: 'Signed in successfully',
        business: result.data.business
      });
    } catch (error) {
      console.error('❌ Business signin error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Sign in failed' 
      });
    }
  }

  /**
   * Business Signout - Clear authentication
   * POST /api/auth/business/signout
   */
  static async businessSignout(req: Request, res: Response): Promise<void> {
    try {
      const business = (req as AuthRequest).business;

      // Clear authentication cookie
      CookieHelper.clearAuthCookie(res);

      // Log signout event
      if (business) {
        console.log(`🚪 Business signout: ${business.name} (${business.email})`);
      }

      res.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error) {
      console.error('❌ Business signout error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Sign out failed' 
      });
    }
  }

  /**
   * Get Current Business - Get authenticated business profile
   * GET /api/auth/me
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const businessId = (req as AuthRequest).business?.id;
      
      if (!businessId) {
        res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        });
        return;
      }

      // Get business profile using service
      const business = await BusinessService.getBusinessProfile(businessId);

      if (!business) {
        res.status(404).json({ 
          success: false,
          error: 'Business profile not found' 
        });
        return;
      }

      res.json({ 
        success: true,
        business
      });
    } catch (error) {
      console.error('❌ Get business profile error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get business profile' 
      });
    }
  }

  /**
   * Refresh Token - Generate new authentication token
   * POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const businessId = (req as AuthRequest).business?.id;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: 'No valid token to refresh'
        });
        return;
      }

      // Refresh token using service
      const result = await AuthService.refreshBusinessToken(businessId);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Type guard: Ensure data and token exist
      if (!result.data || !result.data.token) {
        res.status(500).json({
          success: false,
          error: 'Invalid response from authentication service'
        });
        return;
      }

      // Set new authentication cookie
      CookieHelper.setAuthCookie(res, result.data.token);

      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to refresh token' 
      });
    }
  }

  /**
   * Check Authentication Status - Verify current auth state
   * GET /api/auth/check
   */
  static async checkAuth(req: Request, res: Response): Promise<void> {
    try {
      const business = (req as AuthRequest).business;

      if (!business) {
        res.status(401).json({
          success: false,
          authenticated: false,
          error: 'Not authenticated'
        });
        return;
      }

      res.json({
        success: true,
        authenticated: true,
        business: {
          id: business.id,
          name: business.name,
          email: business.email,
          isVerified: business.isVerified
        }
      });
    } catch (error) {
      console.error('❌ Check auth error:', error);
      res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Authentication check failed'
      });
    }
  }
}