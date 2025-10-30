import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'GPT API is running with Firestore',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: 'Firestore',
  });
});

// Import API routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import contractorRoutes from './routes/contractors';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import publicRoutes from './routes/public';
import fileRoutes from './routes/files';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/files', fileRoutes);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join project room for real-time updates
  socket.on('join-project-room', (projectId: string) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project-${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server (only if not in Firebase Functions)
if (!config.isFirebaseFunction) {
  httpServer.listen(config.port, () => {
    console.log(`🚀 GPT API Server running on port ${config.port}`);
    console.log(`📱 Environment: ${config.nodeEnv}`);
    console.log(`🗄️ Database: Firestore`);
    console.log(`🌐 CORS Origin: ${config.corsOrigin}`);
  });
}

export { io };
export default app;

