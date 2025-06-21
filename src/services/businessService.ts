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
 /**
   * Update business profile
   */
 static async updateBusinessProfile(
  businessId: string, 
  updateData: Partial<BusinessProfile>
): Promise<BusinessProfile | null> {
  try {
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        website: updateData.website,
        description: updateData.description,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        
        // Settings
        stampsPerVisit: updateData.stampsPerVisit,
        minSpendForStamp: updateData.minSpendForStamp,
        maxStampsPerVisit: updateData.maxStampsPerVisit,
        stampsForReward: updateData.stampsForReward,
        rewardType: updateData.rewardType,
        rewardValue: updateData.rewardValue,
        
        // Branding
        primaryColor: updateData.primaryColor,
        slogan: updateData.slogan,
        fontStyle: updateData.fontStyle
      },
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
        updatedAt: true,
        
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

    return {
      ...business,
      stats: {
        totalCustomers: business._count.customers,
        totalStampTransactions: business._count.stampTransactions,
        totalRewards: business._count.rewards
      }
    };
  } catch (error) {
    console.error('❌ Update business profile error:', error);
    return null;
  }
}

/**
 * Get business analytics data
 */
static async getBusinessAnalytics(businessId: string) {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalCustomers,
      newCustomersThisWeek,
      stampsToday,
      stampsThisWeek,
      stampsThisMonth,
      rewardsToday,
      rewardsThisWeek,
      rewardsThisMonth,
      recentTransactions
    ] = await Promise.all([
      prisma.customer.count({ where: { businessId } }),
      prisma.customer.count({ 
        where: { 
          businessId, 
          createdAt: { gte: startOfWeek } 
        } 
      }),
      prisma.stampTransaction.aggregate({
        where: { businessId, createdAt: { gte: startOfToday } },
        _sum: { stampsAwarded: true }
      }),
      prisma.stampTransaction.aggregate({
        where: { businessId, createdAt: { gte: startOfWeek } },
        _sum: { stampsAwarded: true }
      }),
      prisma.stampTransaction.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth } },
        _sum: { stampsAwarded: true }
      }),
      prisma.reward.count({
        where: { businessId, redeemedAt: { gte: startOfToday } }
      }),
      prisma.reward.count({
        where: { businessId, redeemedAt: { gte: startOfWeek } }
      }),
      prisma.reward.count({
        where: { businessId, redeemedAt: { gte: startOfMonth } }
      }),
      prisma.stampTransaction.findMany({
        where: { businessId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { phone: true, firstName: true, lastName: true }
          }
        }
      })
    ]);

    // Calculate retention rate
    const weeklyActiveUsers = await prisma.customer.count({
      where: {
        businessId,
        lastVisit: { gte: startOfWeek }
      }
    });

    const retentionRate = totalCustomers > 0 
      ? Math.round((weeklyActiveUsers / totalCustomers) * 100) 
      : 0;

    return {
      totalStamps: {
        today: stampsToday._sum.stampsAwarded || 0,
        week: stampsThisWeek._sum.stampsAwarded || 0,
        month: stampsThisMonth._sum.stampsAwarded || 0
      },
      rewardsRedeemed: {
        today: rewardsToday,
        week: rewardsThisWeek,
        month: rewardsThisMonth
      },
      appUsers: {
        total: totalCustomers,
        newThisWeek: newCustomersThisWeek
      },
      retentionRate,
      campaignPerformance: {
        sent: 0, // Will implement with promotions
        opened: 0,
        redeemed: 0
      },
      recentActivity: recentTransactions
    };
  } catch (error) {
    console.error('❌ Get business analytics error:', error);
    return null;
  }
}

/**
 * Check if business exists
 */
static async businessExists(businessId: string): Promise<boolean> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true }
    });
    return !!business;
  } catch (error) {
    console.error('❌ Check business exists error:', error);
    return false;
  }
}

/**
 * Get business by email
 */
static async getBusinessByEmail(email: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true
      }
    });
    return business;
  } catch (error) {
    console.error('❌ Get business by email error:', error);
    return null;
  }
}
  
}