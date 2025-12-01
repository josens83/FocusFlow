/**
 * @fileoverview Sessions API 통합 테스트
 *
 * @description
 * 세션 API 엔드포인트의 통합 테스트를 수행합니다.
 */

import { NextRequest } from 'next/server';

// Mock Prisma
const mockPrisma = {
  focusSession: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userStats: {
    upsert: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock NextAuth
const mockSession = {
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
};

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession)),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import after mocks
import { GET, POST, PATCH } from '@/app/api/sessions/route';

describe('Sessions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // GET /api/sessions Tests
  // ==========================================================================
  describe('GET /api/sessions', () => {
    it('should return paginated sessions for authenticated user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'test-user-123',
          type: 'POMODORO_25',
          status: 'COMPLETED',
          plannedDuration: 25,
          actualDuration: 25,
          focusScore: 90,
          startTime: new Date(),
          endTime: new Date(),
          createdAt: new Date(),
        },
      ];

      mockPrisma.focusSession.findMany.mockResolvedValue(mockSessions);
      mockPrisma.focusSession.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/sessions?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sessions).toHaveLength(1);
      expect(data.data.pagination.total).toBe(1);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { getServerSession } = require('next-auth');
      getServerSession.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should filter by status', async () => {
      mockPrisma.focusSession.findMany.mockResolvedValue([]);
      mockPrisma.focusSession.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/sessions?status=COMPLETED');
      await GET(request);

      expect(mockPrisma.focusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrisma.focusSession.findMany.mockResolvedValue([]);
      mockPrisma.focusSession.count.mockResolvedValue(0);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const request = new NextRequest(
        `http://localhost:3000/api/sessions?startDate=${startDate}&endDate=${endDate}`
      );
      await GET(request);

      expect(mockPrisma.focusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startTime: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  // ==========================================================================
  // POST /api/sessions Tests
  // ==========================================================================
  describe('POST /api/sessions', () => {
    it('should create a new session with valid data', async () => {
      const newSession = {
        id: 'new-session-123',
        userId: 'test-user-123',
        type: 'POMODORO_25',
        status: 'IN_PROGRESS',
        plannedDuration: 25,
        startTime: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.focusSession.create.mockResolvedValue(newSession);

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'POMODORO_25',
          plannedDuration: 25,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.session.type).toBe('POMODORO_25');
    });

    it('should use default values when not provided', async () => {
      const newSession = {
        id: 'new-session-123',
        userId: 'test-user-123',
        type: 'POMODORO_25',
        status: 'IN_PROGRESS',
        plannedDuration: 25,
        startTime: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.focusSession.create.mockResolvedValue(newSession);

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.session.type).toBe('POMODORO_25');
      expect(data.data.session.plannedDuration).toBe(25);
    });

    it('should reject invalid session type', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'INVALID_TYPE',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject duration outside valid range', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          plannedDuration: 200, // Max is 180
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ==========================================================================
  // PATCH /api/sessions Tests
  // ==========================================================================
  describe('PATCH /api/sessions', () => {
    it('should update session status to completed', async () => {
      const existingSession = {
        id: 'session-123',
        userId: 'test-user-123',
        type: 'POMODORO_25',
        status: 'IN_PROGRESS',
        plannedDuration: 25,
      };

      const updatedSession = {
        ...existingSession,
        status: 'COMPLETED',
        actualDuration: 25,
        focusScore: 85,
        endTime: new Date(),
      };

      mockPrisma.focusSession.findFirst.mockResolvedValue(existingSession);
      mockPrisma.focusSession.update.mockResolvedValue(updatedSession);
      mockPrisma.userStats.upsert.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'PATCH',
        body: JSON.stringify({
          sessionId: 'session-123',
          status: 'COMPLETED',
          actualDuration: 25,
          focusScore: 85,
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session.status).toBe('COMPLETED');
    });

    it('should reject update without sessionId', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'COMPLETED',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject update for session owned by another user', async () => {
      mockPrisma.focusSession.findFirst.mockResolvedValue(null); // Not found for this user

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'PATCH',
        body: JSON.stringify({
          sessionId: 'other-user-session',
          status: 'COMPLETED',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should reject invalid focusScore', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'PATCH',
        body: JSON.stringify({
          sessionId: 'session-123',
          focusScore: 150, // Max is 100
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
