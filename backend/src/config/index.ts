import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Email (optional)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  
  // Cloud Storage (optional)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.AWS_BUCKET_NAME || 'abt-files',
    region: process.env.AWS_REGION || 'us-east-1',
  },
  
  // Feature Flags
  features: {
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    cloudStorage: process.env.ENABLE_CLOUD_STORAGE === 'true',
  },
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];

export const validateConfig = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Using default values - NOT RECOMMENDED for production!');
  }
  
  if (config.nodeEnv === 'production' && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Run validation
validateConfig();

export default config;
