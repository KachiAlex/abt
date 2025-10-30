import request from 'supertest';
import { app } from '../../functions';
import { db } from '../../config/firestore';
import bcrypt from 'bcryptjs';

// Mock Firestore
jest.mock('../../config/firestore', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
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
  },
  Collections: {
    USERS: 'users',
    PROJECTS: 'projects',
    CONTRACTOR_PROFILES: 'contractorProfiles',
    SUBMISSIONS: 'submissions'
  }
}));

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user
    userId = 'test-user-123';
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'GOVERNMENT_ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock user query
    (db.collection as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{
              data: () => mockUser
            }]
          })
        })
      }),
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockUser
        }),
        update: jest.fn().mockResolvedValue({})
      })
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Test login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.token).toBeDefined();

      const token = loginResponse.body.data.token;

      // Test profile access
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('Projects API', () => {
    beforeEach(() => {
      // Mock projects collection
      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: [{
                data: () => ({
                  id: 'project-123',
                  name: 'Test Project',
                  description: 'Test Description',
                  category: 'TRANSPORTATION',
                  lga: 'Aba North',
                  status: 'IN_PROGRESS',
                  progress: 50,
                  budget: 1000000,
                  isPublic: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                })
              }]
            })
          })
        }),
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id: 'project-123',
              name: 'Test Project',
              description: 'Test Description',
              category: 'TRANSPORTATION',
              lga: 'Aba North',
              status: 'IN_PROGRESS',
              progress: 50,
              budget: 1000000,
              isPublic: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }),
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({})
        })
      });
    });

    it('should get projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeDefined();
    });

    it('should get project by ID', async () => {
      const response = await request(app)
        .get('/api/projects/project-123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toBeDefined();
    });

    it('should create new project (admin only)', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Test Project',
          description: 'New Test Description',
          category: 'HEALTHCARE',
          lga: 'Umuahia North',
          budget: 2000000,
          fundingSource: 'State Budget',
          startDate: '2024-01-01',
          expectedEndDate: '2024-12-31'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toBeDefined();
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      // Mock public projects
      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: [{
                data: () => ({
                  id: 'public-project-123',
                  name: 'Public Test Project',
                  description: 'Public Test Description',
                  category: 'EDUCATION',
                  lga: 'Aba South',
                  status: 'IN_PROGRESS',
                  progress: 75,
                  budget: 1500000,
                  isPublic: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                })
              }]
            })
          })
        }),
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              id: 'public-project-123',
              name: 'Public Test Project',
              description: 'Public Test Description',
              category: 'EDUCATION',
              lga: 'Aba South',
              status: 'IN_PROGRESS',
              progress: 75,
              budget: 1500000,
              isPublic: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          })
        })
      });
    });

    it('should get public projects without authentication', async () => {
      const response = await request(app)
        .get('/api/public/projects');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeDefined();
    });

    it('should get public project details', async () => {
      const response = await request(app)
        .get('/api/public/projects/public-project-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toBeDefined();
    });

    it('should get public statistics', async () => {
      const response = await request(app)
        .get('/api/public/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle 401 for protected routes without token', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
