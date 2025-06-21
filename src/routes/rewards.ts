import express from 'express';
// import { RewardController } from '../controllers/rewardController';
import { authenticateBusiness } from '../middleware/auth';

const router = express.Router();

// Reward Management (to be implemented later)
// router.get('/', authenticateBusiness, RewardController.getRewards);
// router.post('/redeem', authenticateBusiness, RewardController.redeemReward);
// router.get('/rules', authenticateBusiness, RewardController.getRewardRules);
// router.put('/rules', authenticateBusiness, RewardController.updateRewardRules);

export default router;