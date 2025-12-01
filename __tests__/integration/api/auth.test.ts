/**
 * @fileoverview Auth API 통합 테스트
 *
 * @description
 * 인증 API 엔드포인트의 통합 테스트를 수행합니다.
 */

import { NextRequest } from 'next/server';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
}));

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userStats: {
    create: jest.fn(),
  },
  userStreak: {
    create: jest.fn(),
  },
  garden: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock rate limiting
jest.mock('@/lib/api-utils', () => ({
  ...jest.requireActual('@/lib/api-utils'),
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 })),
  apiResponse: jest.requireActual('@/lib/api-utils').apiResponse,
  apiError: jest.requireActual('@/lib/api-utils').apiError,
  auditLog: jest.fn(),
}));

// Import after mocks
import { POST } from '@/app/api/auth/signup/route';

describe('Auth API - Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Successful Registration Tests
  // ==========================================================================
  describe('successful registration', () => {
    it('should create a new user with valid data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      });
      mockPrisma.userStats.create.mockResolvedValue({});
      mockPrisma.userStreak.create.mockResolvedValue({});
      mockPrisma.garden.create.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.user).not.toHaveProperty('password');
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'TEST@EXAMPLE.COM',
          password: 'SecureP@ss1',
        }),
      });

      await POST(request);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should trim name whitespace', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: '  Test User  ',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      await POST(request);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test User',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // Validation Error Tests
  // ==========================================================================
  describe('validation errors', () => {
    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'not-an-email',
          password: 'SecureP@ss1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject short name', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'A',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          // missing email and password
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ==========================================================================
  // Duplicate Email Tests
  // ==========================================================================
  describe('duplicate email handling', () => {
    it('should reject registration with existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('이미 사용 중인 이메일');
    });
  });

  // ==========================================================================
  // Rate Limiting Tests
  // ==========================================================================
  describe('rate limiting', () => {
    it('should reject requests when rate limit exceeded', async () => {
      const { checkRateLimit } = require('@/lib/api-utils');
      checkRateLimit.mockReturnValueOnce({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
    });
  });

  // ==========================================================================
  // XSS Prevention Tests
  // ==========================================================================
  describe('XSS prevention', () => {
    it('should strip HTML tags from name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-123',
        name: 'alert("xss")Test',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>Test',
          email: 'test@example.com',
          password: 'SecureP@ss1',
        }),
      });

      await POST(request);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.not.stringContaining('<script>'),
          }),
        })
      );
    });
  });
});
