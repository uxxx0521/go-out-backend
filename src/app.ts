import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

// Import centralized routes
import apiRoutes from './routes';

// Initialize Prisma
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // This is crucial for cookies!
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
  }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root health check endpoint (outside of API routes)
app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service: 'Go Out! Backend API',
      version: '1.0.0'
    });
  });

// API Routes - All routes are now centralized
app.use('/api', apiRoutes);


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ 
      success: false,
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      availableEndpoints: {
        health: 'GET /health',
        api: {
          auth: 'POST /api/auth/business/signin, /api/auth/business/signup',
          businesses: 'GET /api/businesses/profile, /api/businesses/analytics',
          customers: 'GET /api/customers, GET /api/customers/:id',
          stamps: 'POST /api/stamps/generate-qr, GET /api/stamps/qr-status/:qrId'
        }
      }
    });
  });

export default app;