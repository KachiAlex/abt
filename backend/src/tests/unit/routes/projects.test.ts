import request from 'supertest';
import express from 'express';
import projectRoutes from '../../../routes/projects';
import jwt from 'jsonwebtoken';

// Mock config to provide JWT secret
jest.mock('../../../config', () => ({
	config: {
		jwtSecret: 'test-secret-key'
	}
}));

// Mock Firestore
jest.mock('../../../config/firestore', () => ({
	db: {
		collection: jest.fn(() => ({
			get: jest.fn(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			doc: jest.fn(() => ({
				get: jest.fn(),
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn()
			}))
		}))
	},
	Collections: {
		PROJECTS: 'projects',
		CONTRACTOR_PROFILES: 'contractorProfiles',
		MILESTONES: 'milestones',
		SUBMISSIONS: 'submissions'
	}
}));

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

const signToken = (payload: any) => jwt.sign(payload, 'test-secret-key');

describe('Projects Routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('GET /api/projects', () => {
		it('returns projects list', async () => {
			const mockProjects = [{ id: 'p1', name: 'Test', description: 'Desc', lga: 'Aba', budget: 1, progress: 0, status: 'IN_PROGRESS' }];
            const { db } = require('../../../config/firestore');
			(db.collection as jest.Mock).mockReturnValue({
				where: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue({ docs: mockProjects.map((p) => ({ data: () => p })) })
			});
			(db.collection as jest.Mock).mockReturnValueOnce({
				get: jest.fn().mockResolvedValue({ size: mockProjects.length })
			});

			const token = signToken({ userId: 'u1', role: 'GOVERNMENT_ADMIN' });
			const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`);
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(Array.isArray(res.body.data.projects)).toBe(true);
		});
	});

	describe('GET /api/projects/:id', () => {
		it('returns project by id', async () => {
			const project = { id: 'p1', name: 'P', description: 'D', lga: 'A', budget: 1, progress: 0, status: 'IN_PROGRESS' };
            const { db } = require('../../../config/firestore');
			(db.collection as jest.Mock).mockReturnValueOnce({
				doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => project }) })
			});
			// milestones
			(db.collection as jest.Mock).mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue({ docs: [] })
			});
			// submissions
			(db.collection as jest.Mock).mockReturnValueOnce({
				where: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue({ docs: [] })
			});

			const token = signToken({ userId: 'u1', role: 'GOVERNMENT_ADMIN' });
			const res = await request(app).get('/api/projects/p1').set('Authorization', `Bearer ${token}`);
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data.project.id).toBe('p1');
		});
	});

	describe('POST /api/projects', () => {
		it('creates project as admin', async () => {
            const { db } = require('../../../config/firestore');
			(db.collection as jest.Mock).mockReturnValueOnce({
				doc: jest.fn().mockReturnValue({ set: jest.fn().mockResolvedValue({}) })
			});

			const token = signToken({ userId: 'u1', role: 'GOVERNMENT_ADMIN' });
			const res = await request(app)
				.post('/api/projects')
				.set('Authorization', `Bearer ${token}`)
				.send({
					name: 'N', description: 'D', category: 'HEALTHCARE', lga: 'A', budget: 1, fundingSource: 'X', startDate: '2024-01-01', expectedEndDate: '2024-12-31'
				});
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
		});
	});

	describe('GET /api/projects/stats', () => {
		it('returns project stats', async () => {
			const projects = [{ status: 'IN_PROGRESS', budget: 1, allocatedBudget: 1, spentBudget: 0, progress: 50 }];
            const { db } = require('../../../config/firestore');
			(db.collection as jest.Mock).mockReturnValue({
				get: jest.fn().mockResolvedValue({ docs: projects.map((p) => ({ data: () => p })) })
			});
			const token = signToken({ userId: 'u1', role: 'GOVERNMENT_ADMIN' });
			const res = await request(app).get('/api/projects/stats').set('Authorization', `Bearer ${token}`);
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data.stats.total).toBeDefined();
		});
	});
});
