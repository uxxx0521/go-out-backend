export interface BusinessProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    description?: string;
    logo?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    timezone?: string;
    isVerified: boolean;
    createdAt: Date;
    
    // Settings
    stampsPerVisit: number;
    minSpendForStamp: number;
    maxStampsPerVisit: number;
    stampsForReward: number;
    rewardType: string;
    rewardValue: number;
    
    // Branding
    primaryColor: string;
    slogan: string;
    fontStyle: string;
    
    // Stats
    stats: {
      totalCustomers: number;
      totalStampTransactions: number;
      totalRewards: number;
    };
  }
  