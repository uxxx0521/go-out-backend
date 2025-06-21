import { Request } from 'express';

export interface AuthRequest extends Request {
    business?: {
      id: string;
      name: string;
      email: string;
      isVerified: boolean;
    };
    customer?: {
      id: string;
      phone: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      businessId: string;
      isVerified: boolean;
    };
  }
  
  export interface BusinessSignupData {
    businessName: string;
    businessType: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessZip: string;
    businessPhone: string;
    businessWebsite?: string;
    ownerEmail: string;
    ownerPassword: string;
  }
  
  export interface AuthResult {
    success: boolean;
    error?: string;
    data?: {
      business?: any;
      token?: string;
    };
  }