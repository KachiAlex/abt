import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
import prisma from './config/database';

// Import routes (we'll create these next)
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import contractorRoutes from './routes/contractors';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';
import publicRoutes from './routes/public';
import userRoutes from './routes/users';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.socketCorsOrigin,
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
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ABT API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/users', userRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

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

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Only start server if not in Firebase Functions environment
    if (!process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
      httpServer.listen(config.port, () => {
        console.log(`🚀 ABT API Server running on port ${config.port}`);
        console.log(`📱 Environment: ${config.nodeEnv}`);
        console.log(`🌐 CORS Origin: ${config.corsOrigin}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (!process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
      process.exit(1);
    }
  }
};

// Graceful shutdown (only for standalone server)
if (!process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    httpServer.close(() => {
      console.log('Process terminated');
    });
  });
}

startServer();

export { io };
export default app;
