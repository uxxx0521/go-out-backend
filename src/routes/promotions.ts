import express from 'express';
// import { PromotionController } from '../controllers/promotionController';
import { authenticateBusiness } from '../middleware/auth';

const router = express.Router();

// Promotion Management (to be implemented later)
// router.get('/', authenticateBusiness, PromotionController.getPromotions);
// router.post('/', authenticateBusiness, PromotionController.createPromotion);
// router.get('/:promotionId', authenticateBusiness, PromotionController.getPromotion);
// router.put('/:promotionId', authenticateBusiness, PromotionController.updatePromotion);
// router.delete('/:promotionId', authenticateBusiness, PromotionController.deletePromotion);
// router.post('/:promotionId/send', authenticateBusiness, PromotionController.sendPromotion);

export default router;