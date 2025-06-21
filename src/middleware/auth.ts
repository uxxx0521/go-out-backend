// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { logError } from '../utils/errorHandler';
import { AuthRequest } from '../types/auth';

/**
 * Middleware to authenticate business users
 * Checks for valid JWT token in cookies or Authorization header
 */
export const authenticateBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = req.cookies?.auth_token;
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'Access denied. No authentication token provided.',
        code: 'NO_TOKEN'
      });
      return; 
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET environment variable is not set');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return; 
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Check token type
    if (decoded.type !== 'business') {
      res.status(401).json({ 
        success: false,
        error: 'Invalid token type.',
        code: 'INVALID_TOKEN_TYPE'
      });
      return;
    }

    // Find business in database
    const business = await prisma.business.findUnique({
      where: { id: decoded.businessId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true
      }
    });

    if (!business) {
      res.status(401).json({ 
        success: false,
        error: 'Business account not found.',
        code: 'BUSINESS_NOT_FOUND'
      });
      return; 
    }

    // Cast request to AuthRequest and attach business info for next middleware/function
    (req as AuthRequest).business = business; 
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication token has expired.',
        code: 'TOKEN_EXPIRED'
      });
      return; 
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
      return; 
    }

    logError('Authentication middleware', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
    return; 
  }
};

/**
 * Middleware to authenticate customer users
 * Checks for valid customer JWT token
 */
export const authenticateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = req.cookies?.customer_token;
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'Access denied. No authentication token provided.',
        code: 'NO_TOKEN'
      });
      return; 
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET environment variable is not set');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return; 
    }

    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type !== 'customer') {
      res.status(401).json({ 
        success: false,
        error: 'Invalid token type.',
        code: 'INVALID_TOKEN_TYPE'
      });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        businessId: true,
        isVerified: true
      }
    });

    if (!customer) {
      res.status(401).json({ 
        success: false,
        error: 'Customer account not found.',
        code: 'CUSTOMER_NOT_FOUND'
      });
      return; 
    }

    // Cast request to AuthRequest and attach customer info
    (req as AuthRequest).customer = customer;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication token has expired.',
        code: 'TOKEN_EXPIRED'
      });
      return; 
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
      return; 
    }

    logError('Customer authentication middleware', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
    return;
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is valid, but doesn't block if missing
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.auth_token;
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as any;
        
        if (decoded.type === 'business') {
          const business = await prisma.business.findUnique({
            where: { id: decoded.businessId },
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true
            }
          });
          
          if (business) {
            // Cast request to AuthRequest and attach business info
            (req as AuthRequest).business = business;
          }
        }
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without auth
    next();
  }
};