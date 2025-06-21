// src/utils/validation.ts
import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Handle validation errors middleware
 * Collects all validation errors and returns them in a structured format
 */
export const handleValidationErrors: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors
    });
    return; // Important: return after sending response
  }
  
  next();
};

/**
 * Business signup validation middleware
 * Validates all required fields for business registration
 */
export const businessSignupValidation: (ValidationChain | RequestHandler)[] = [
  // Business Information
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),

  body('businessType')
    .notEmpty()
    .withMessage('Business type is required')
    .isIn([
      'restaurant', 'cafe', 'bakery', 'bar', 'food_truck', 
      'retail', 'salon', 'fitness', 'service', 'other'
    ])
    .withMessage('Please select a valid business type'),

  body('businessAddress')
    .trim()
    .notEmpty()
    .withMessage('Business address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('businessCity')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('businessState')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('businessZip')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid ZIP code (12345 or 12345-6789)'),

  body('businessPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/)
    .withMessage('Please enter a valid phone number'),

  body('businessWebsite')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please enter a valid website URL (including http:// or https://)'),

  // Owner Information
  body('ownerEmail')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),

  body('ownerPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, lowercase letter, number, and special character'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Business signin validation middleware
 * Validates email and password for business login
 */
export const businessSigninValidation: (ValidationChain | RequestHandler)[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean value'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Customer registration validation middleware
 * Validates customer signup data
 */
export const customerSignupValidation: (ValidationChain | RequestHandler)[] = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/)
    .withMessage('Please enter a valid phone number'),

  body('businessId')
    .notEmpty()
    .withMessage('Business ID is required')
    .isString()
    .withMessage('Business ID must be a string'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Business profile update validation middleware
 */
export const businessUpdateValidation: (ValidationChain | RequestHandler)[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/)
    .withMessage('Please enter a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please enter a valid website URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  body('stampsPerVisit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stamps per visit must be between 1 and 10'),

  body('maxStampsPerVisit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Maximum stamps per visit must be between 1 and 20'),

  body('stampsForReward')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Stamps for reward must be between 5 and 50'),

  body('rewardValue')
    .optional()
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('Reward value must be between $0.01 and $1000'),

  body('primaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be a valid hex color (e.g., #FF0000)'),

  body('slogan')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Slogan must be less than 100 characters'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * QR generation validation middleware
 */
export const qrGenerationValidation: (ValidationChain | RequestHandler)[] = [
  body('stampsValue')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stamps value must be between 1 and 10'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Manual stamp granting validation middleware
 */
export const manualStampValidation: (ValidationChain | RequestHandler)[] = [
  body('customerPhone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone number is required')
    .matches(/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/)
    .withMessage('Please enter a valid phone number'),

  body('stampsValue')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stamps value must be between 1 and 10'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must be less than 200 characters'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Password reset request validation middleware
 */
export const passwordResetRequestValidation: (ValidationChain | RequestHandler)[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Password reset validation middleware
 */
export const passwordResetValidation: (ValidationChain | RequestHandler)[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, lowercase letter, number, and special character'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Email verification validation middleware
 */
export const emailVerificationValidation: (ValidationChain | RequestHandler)[] = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),

  // Handle validation errors
  handleValidationErrors
];