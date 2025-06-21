import { prisma } from '../app';
import { BusinessProfile } from '../types/business';

export class BusinessService {
  /**
   * Get complete business profile with stats
   */
  static async getBusinessProfile(businessId: string): Promise<BusinessProfile | null> {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
          description: true,
          logo: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          timezone: true,
          isVerified: true,
          createdAt: true,
          
          // Business settings
          stampsPerVisit: true,
          minSpendForStamp: true,
          maxStampsPerVisit: true,
          stampsForReward: true,
          rewardType: true,
          rewardValue: true,
          
          // Branding
          primaryColor: true,
          slogan: true,
          fontStyle: true,
          
          // Stats
          _count: {
            select: {
              customers: true,
              stampTransactions: true,
              rewards: true
            }
          }
        }
      });

      if (!business) return null;

      return {
        ...business,
        stats: {
          totalCustomers: business._count.customers,
          totalStampTransactions: business._count.stampTransactions,
          totalRewards: business._count.rewards
        }
      };
    } catch (error) {
      console.error('❌ Get business profile error:', error);
      return null;
    }
  }
}