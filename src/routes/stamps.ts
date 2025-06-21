import express from 'express';
import { StampController } from '../controllers/stampController';
import { authenticateBusiness } from '../middleware/auth';

const router = express.Router();

// QR Code Generation & Management
router.post('/generate-qr', authenticateBusiness, StampController.generateQr);
router.get('/qr-status/:qrId', authenticateBusiness, StampController.checkQrStatus);

// Manual Stamp Management
router.post('/grant-manual', authenticateBusiness, StampController.grantManual);

// Stamp Rules Management (we'll add these controllers later)
// router.get('/rules', authenticateBusiness, StampController.getStampRules);
// router.put('/rules', authenticateBusiness, StampController.updateStampRules);

// Stamp History & Reports
// router.get('/history', authenticateBusiness, StampController.getStampHistory);
// router.get('/transactions', authenticateBusiness, StampController.getTransactions);

export default router;