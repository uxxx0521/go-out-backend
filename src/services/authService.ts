import { prisma } from '../app';
import { hashPassword, comparePassword, generateBusinessToken } from '../utils/auth';
import { BusinessSignupData, AuthResult } from '../types/auth';

export class AuthService {
  /**
   * Create new business account
   */
  static async createBusinessAccount(signupData: BusinessSignupData): Promise<AuthResult> {
    try {
      const { 
        businessName, 
        businessType,
        businessAddress,
        businessCity,
        businessState,
        businessZip,
        businessPhone,
        businessWebsite,
        ownerEmail, 
        ownerPassword 
      } = signupData;

      // Check if business already exists
      const existingBusiness = await prisma.business.findUnique({
        where: { email: ownerEmail.toLowerCase().trim() }
      });

      if (existingBusiness) {
        return {
          success: false,
          error: 'A business with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(ownerPassword);

      // Create business
      const business = await prisma.business.create({
        data: {
          name: businessName.trim(),
          email: ownerEmail.toLowerCase().trim(),
          password: hashedPassword,
          phone: businessPhone.trim(),
          website: businessWebsite?.trim() || null,
          address: businessAddress.trim(),
          city: businessCity.trim(),
          state: businessState.trim(),
          zipCode: businessZip.trim(),
          description: `${businessType} business`,
          
          // Default configuration
          stampsPerVisit: 1,
          minSpendForStamp: 0.0,
          maxStampsPerVisit: 5,
          stampsForReward: 10,
          rewardType: 'Free Coffee',
          rewardValue: 5.0,
          primaryColor: '#8b5cf6',
          slogan: 'Collect your stamp card!',
          fontStyle: 'modern'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = generateBusinessToken(business.id);

      console.log(`✅ New business signup: ${business.name} (${business.email})`);

      return {
        success: true,
        data: {
          business,
          token
        }
      };
    } catch (error) {
      console.error('❌ Create business account error:', error);
      
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'This email is already registered'
        };
      }
      
      return {
        success: false,
        error: 'Failed to create business account'
      };
    }
  }

  /**
   * Authenticate business with email and password
   */
  static async authenticateBusiness(email: string, password: string): Promise<AuthResult> {
    try {
      // Find business by email
      const business = await prisma.business.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (!business) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, business.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate token
      const token = generateBusinessToken(business.id);

      console.log(`🔐 Business signin: ${business.name} (${business.email})`);

      return {
        success: true,
        data: {
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
            phone: business.phone,
            isVerified: business.isVerified
          },
          token
        }
      };
    } catch (error) {
      console.error('❌ Authenticate business error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Refresh business authentication token
   */
  static async refreshBusinessToken(businessId: string): Promise<AuthResult> {
    try {
      // Verify business still exists
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true, name: true, email: true, isVerified: true }
      });

      if (!business) {
        return {
          success: false,
          error: 'Business account no longer exists'
        };
      }

      // Generate new token
      const token = generateBusinessToken(business.id);

      console.log(`🔄 Token refreshed for: ${business.name}`);

      return {
        success: true,
        data: { token }
      };
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }
}