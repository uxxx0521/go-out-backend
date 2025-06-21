import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateBusiness } from '../middleware/auth';
import { businessSignupValidation, businessSigninValidation } from '../utils/validation';

const router = express.Router();

// Business Authentication Routes
router.post('/business/signup', businessSignupValidation, AuthController.businessSignup);
router.post('/business/signin', businessSigninValidation, AuthController.businessSignin);
router.post('/business/signout', AuthController.businessSignout);
router.get('/me', authenticateBusiness, AuthController.getMe);
router.post('/refresh', authenticateBusiness, AuthController.refreshToken);
router.get('/check', authenticateBusiness, AuthController.checkAuth);

export default router;