import express from 'express';
import { BusinessController } from '../controllers/businessController';
import { authenticateBusiness } from '../middleware/auth';

const router = express.Router();

// Business Profile Management
router.get('/profile', authenticateBusiness, BusinessController.getProfile);
router.put('/profile', authenticateBusiness, BusinessController.updateProfile);

// Business Analytics
router.get('/analytics', authenticateBusiness, BusinessController.getAnalytics);

// Business Settings (we'll add these controllers later)
// router.get('/settings', authenticateBusiness, BusinessController.getSettings);
// router.put('/settings', authenticateBusiness, BusinessController.updateSettings);

// Business Hours Management
// router.get('/hours', authenticateBusiness, BusinessController.getBusinessHours);
// router.put('/hours', authenticateBusiness, BusinessController.updateBusinessHours);

export default router;