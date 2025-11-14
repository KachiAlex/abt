import request from 'supertest';
import express from 'express';
import authRoutes from '../../../routes/auth';
import { db } from '../../../config/firestore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the database
jest.mock('../../../config/firestore', () => {
const chain: any = {
  where: jest.fn((): any => chain),
  limit: jest.fn((): any => ({ get: jest.fn() })),
  get: jest.fn()
};
	return {
		db: {
			collection: jest.fn(() => ({
				where: chain.where,
				limit: chain.limit,
				get: chain.get,
				doc: jest.fn(() => ({
					get: jest.fn(),
					update: jest.fn()
				}))
			}))
		},
		Collections: {
			USERS: 'users'
		}
	};
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'CONTRACTOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockQuerySnapshot = {
        empty: false,
        docs: [{
          data: () => mockUser
        }]
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot)
          })
        })
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot)
          })
        })
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CONTRACTOR',
        isActive: true
      };

      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'CONTRACTOR' },
        'test-secret-key'
      );

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockUser
          })
        })
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot)
          })
        }),
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue({})
        })
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'CONTRACTOR'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
    });

    it('should return 409 for existing email', async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [{
          data: () => ({ email: 'existing@example.com' })
        }]
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockQuerySnapshot)
          })
        })
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'CONTRACTOR'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
          // missing firstName, lastName, role
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email, password, firstName, lastName, and role are required');
    });
  });
});
