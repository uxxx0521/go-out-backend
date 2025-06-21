import express from 'express';
import authRoutes from './auth';
import businessRoutes from './businesses';
import customerRoutes from './customers';
import stampRoutes from './stamps';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Register all route modules
router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/customers', customerRoutes);
router.use('/stamps', stampRoutes);

export default router;