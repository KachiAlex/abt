import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Import routes
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import projectRoutes from './routes/projects';
import contractorRoutes from './routes/contractors';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import publicRoutes from './routes/public';
import seedRoutes from './routes/seed';

// Import config to initialize Firestore
import './config/firestore';
import './config';

// Configure global options
setGlobalOptions({ region: 'us-central1' });

export const app = express();

// Basic middleware
app.use(cors({ origin: true }));
app.use(helmet());
app.use(compression());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'GPT API is running with Firestore',
    timestamp: new Date().toISOString(),
    environment: 'production',
    database: 'Firestore',
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/seed', seedRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Export the Express app as a Firebase Function (v2)
export const api = onRequest(
  {
    timeoutSeconds: 540,
    memory: '1GiB',
    cors: true,
    invoker: 'public',
  },
  app
);