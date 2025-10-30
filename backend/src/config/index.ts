import dotenv from 'dotenv';

// Check if running in Firebase Functions BEFORE loading .env
const isFirebaseFunction = !!process.env.FUNCTION_TARGET || !!process.env.K_SERVICE || !!process.env.FUNCTIONS_EMULATOR;

// Load environment variables only for local development (not in Functions)
if (!isFirebaseFunction) {
  dotenv.config();
}

// Debug logging
console.log('Environment detection:');
console.log('FUNCTION_TARGET:', process.env.FUNCTION_TARGET);
console.log('K_SERVICE:', process.env.K_SERVICE);
console.log('FUNCTIONS_EMULATOR:', process.env.FUNCTIONS_EMULATOR);
console.log('isFirebaseFunction:', isFirebaseFunction);

// Import Firebase Functions conditionally
let functionsConfig: any = {};
try {
  const functions = require('firebase-functions');
  functionsConfig = functions.config();
  if (Object.keys(functionsConfig).length > 0) {
    console.log('✅ Loaded Firebase Functions config');
  }
} catch (error) {
  console.warn('Firebase Functions config not available, using environment variables');
}

export const config = {
  // Server
  nodeEnv: isFirebaseFunction ? 'production' : (process.env.NODE_ENV || 'development'),
  port: parseInt(process.env.PORT || '5000', 10),
  isFirebaseFunction,
  
  // JWT - Check functions config first (for deployed Functions), then env vars
  jwtSecret: functionsConfig.jwt?.secret || process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || functionsConfig.jwt?.expires || '7d',
  
  // File Upload
  maxFileSize: parseInt(functionsConfig.upload?.maxsize || process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  uploadPath: isFirebaseFunction ? '/tmp' : (process.env.UPLOAD_PATH || 'uploads'), // Firebase Functions use /tmp
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(functionsConfig.ratelimit?.window || process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(functionsConfig.ratelimit?.max || process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // CORS - Support both Firebase config and .env
  corsOrigin: functionsConfig.cors?.origin || process.env.CORS_ORIGIN || 'http://localhost:5173',
  socketCorsOrigin: functionsConfig.cors?.origin || process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
  
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
  
  // Only throw in production for non-Firebase environments
  // Firebase Functions should use Firebase Config or defaults
  if (!isFirebaseFunction && config.nodeEnv === 'production' && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Run validation (won't throw in Firebase Functions)
validateConfig();

export default config;

