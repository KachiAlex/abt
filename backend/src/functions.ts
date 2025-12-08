// Ultra-minimal function entry - avoids deployment timeout
// Everything loads lazily on first request

import { onRequest } from 'firebase-functions/v1/https';

// Declare global types for lazy-loaded app
declare global {
  var expressApp: any;
  var appInitialized: boolean;
}

// Initialize app lazily - defer ALL imports to avoid deployment timeout
const getApp = (): any => {
  if (!global.appInitialized) {
    // Lazy load Express
    const express = require('express');
    const app = express();
    
    // Load everything lazily
    const cors = require('cors');
    const helmet = require('helmet');
    const compression = require('compression');
    
    // Load config - defer firestore until routes actually need it
    const { config } = require('./config');
    
    // Only load firestore if not in deployment analysis mode
    // Firebase sets FUNCTION_TARGET during deployment analysis
    if (!process.env.FUNCTION_TARGET || process.env.FUNCTION_TARGET === 'apiV1') {
      try {
    require('./config/firestore');
      } catch (e) {
        // Ignore during deployment analysis
      }
    }
    
    // Setup CORS - must be before other middleware
    // Allow production frontend and localhost for development
    const allowedOrigins = [
      'https://abt-abia-tracker.web.app',
      'https://abt-abia-tracker.firebaseapp.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    app.use(cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // For development, allow all origins
          if (config.nodeEnv === 'development') {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Authorization'],
    }));
    
    // Configure helmet to not interfere with CORS
    app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }));
    app.use(compression());
    app.use(express.json());
    
    // Health check
    app.get('/health', (_req: any, res: any) => {
      res.json({ success: true, message: 'API ready' });
    });
    
    // Load and mount routes
    app.use('/api/auth', require('./routes/auth').default);
    app.use('/api/files', require('./routes/files').default);
    app.use('/api/projects', require('./routes/projects').default);
    app.use('/api/contractors', require('./routes/contractors').default);
    app.use('/api/submissions', require('./routes/submissions').default);
    app.use('/api/dashboard', require('./routes/dashboard').default);
    app.use('/api/public', require('./routes/public').default);
    app.use('/api/seed', require('./routes/seed').default);
    
    // Error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    });
    
    // 404 handler
    app.use((_req: any, res: any) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });
    
    // Store app globally
    global.expressApp = app;
    global.appInitialized = true;
  }
  
  return global.expressApp;
};

// Export app placeholder to avoid initialization during deployment analysis
export const app = { use: () => {}, get: () => {}, post: () => {} } as any;

// Export as v1 function (free tier compatible)
// Using apiV1 name to avoid conflict with existing v2 function named 'api'
// Create a wrapper that calls getApp() only when request arrives
// Using handler function to avoid initialization during deployment analysis
export const apiV1 = onRequest((req: any, res: any) => {
  const handlerApp = getApp();
  handlerApp(req, res);
});

// Note: 'api' export removed to avoid conflict with existing v2 deployment
// After old v2 function is removed (requires billing enabled), 
// we can rename apiV1 back to api
