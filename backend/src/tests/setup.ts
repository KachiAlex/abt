// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn()
        })),
        get: jest.fn()
      })),
      add: jest.fn(),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn()
        })),
        get: jest.fn()
      }))
    })),
    settings: jest.fn()
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn()
  })),
  storage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        createWriteStream: jest.fn(() => ({
          on: jest.fn(),
          end: jest.fn()
        })),
        makePublic: jest.fn(),
        delete: jest.fn(),
        getMetadata: jest.fn(),
        getSignedUrl: jest.fn()
      }))
    }))
  })),
  apps: []
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
