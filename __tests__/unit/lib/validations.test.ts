/**
 * @fileoverview Validation Schema 테스트
 *
 * @description
 * Zod 스키마의 정확한 검증 동작을 테스트합니다.
 *
 * @testCoverage
 * - Happy path: 유효한 입력
 * - Edge cases: 경계값
 * - Error cases: 잘못된 입력
 */

import {
  emailSchema,
  passwordSchema,
  nameSchema,
  signupSchema,
  createSessionSchema,
  updateSessionSchema,
  paginationSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  // ==========================================================================
  // Email Schema Tests
  // ==========================================================================
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.kr',
        'user+tag@example.org',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should lowercase and trim email', () => {
      const result = emailSchema.parse('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@no-local-part.com',
        'no-at-sign.com',
        'no-domain@',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should reject emails longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Password Schema Tests
  // ==========================================================================
  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      const validPasswords = [
        'Password1!',
        'SecureP@ss123',
        'MyP@ssw0rd!',
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject passwords without uppercase', () => {
      const result = passwordSchema.safeParse('password1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const result = passwordSchema.safeParse('Password!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      const result = passwordSchema.safeParse('Password1');
      expect(result.success).toBe(false);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Pass1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPassword = 'Aa1!' + 'a'.repeat(130);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Name Schema Tests
  // ==========================================================================
  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const validNames = ['John', 'Jane Doe', '홍길동', 'José'];

      validNames.forEach((name) => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });

    it('should trim whitespace', () => {
      const result = nameSchema.parse('  John Doe  ');
      expect(result).toBe('John Doe');
    });

    it('should strip HTML tags (XSS prevention)', () => {
      const result = nameSchema.parse('<script>alert("xss")</script>John');
      expect(result).toBe('alert("xss")John');
      expect(result).not.toContain('<script>');
    });

    it('should reject names shorter than 2 characters', () => {
      const result = nameSchema.safeParse('J');
      expect(result.success).toBe(false);
    });

    it('should reject names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Signup Schema Tests
  // ==========================================================================
  describe('signupSchema', () => {
    const validSignup = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecureP@ss1',
    };

    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it('should reject signup with missing name', () => {
      const { name, ...withoutName } = validSignup;
      const result = signupSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });

    it('should reject signup with missing email', () => {
      const { email, ...withoutEmail } = validSignup;
      const result = signupSchema.safeParse(withoutEmail);
      expect(result.success).toBe(false);
    });

    it('should reject signup with missing password', () => {
      const { password, ...withoutPassword } = validSignup;
      const result = signupSchema.safeParse(withoutPassword);
      expect(result.success).toBe(false);
    });

    it('should transform email to lowercase', () => {
      const result = signupSchema.parse({
        ...validSignup,
        email: 'JOHN@EXAMPLE.COM',
      });
      expect(result.email).toBe('john@example.com');
    });
  });

  // ==========================================================================
  // Session Schema Tests
  // ==========================================================================
  describe('createSessionSchema', () => {
    it('should accept minimal valid session data', () => {
      const result = createSessionSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('POMODORO_25');
      expect(result.data?.plannedDuration).toBe(25);
    });

    it('should accept full valid session data', () => {
      const result = createSessionSchema.safeParse({
        type: 'POMODORO_50',
        plannedDuration: 50,
        taskId: 'clxxxxxxxxxxxxxxxxxx',
        tags: ['work', 'focus'],
        soundscapeId: 'clxxxxxxxxxxxxxxxxxx',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid session type', () => {
      const result = createSessionSchema.safeParse({
        type: 'INVALID_TYPE',
      });
      expect(result.success).toBe(false);
    });

    it('should reject duration outside valid range', () => {
      expect(createSessionSchema.safeParse({ plannedDuration: 0 }).success).toBe(false);
      expect(createSessionSchema.safeParse({ plannedDuration: 181 }).success).toBe(false);
    });

    it('should reject too many tags', () => {
      const result = createSessionSchema.safeParse({
        tags: Array(11).fill('tag'),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateSessionSchema', () => {
    it('should require sessionId', () => {
      const result = updateSessionSchema.safeParse({
        status: 'COMPLETED',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid update data', () => {
      const result = updateSessionSchema.safeParse({
        sessionId: 'clxxxxxxxxxxxxxxxxxx',
        status: 'COMPLETED',
        actualDuration: 25,
        focusScore: 85,
      });
      expect(result.success).toBe(true);
    });

    it('should reject focusScore outside 0-100 range', () => {
      expect(
        updateSessionSchema.safeParse({
          sessionId: 'clxxxxxxxxxxxxxxxxxx',
          focusScore: -1,
        }).success
      ).toBe(false);
      expect(
        updateSessionSchema.safeParse({
          sessionId: 'clxxxxxxxxxxxxxxxxxx',
          focusScore: 101,
        }).success
      ).toBe(false);
    });
  });

  // ==========================================================================
  // Pagination Schema Tests
  // ==========================================================================
  describe('paginationSchema', () => {
    it('should use default values when not provided', () => {
      const result = paginationSchema.parse({});
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should parse string values to numbers', () => {
      const result = paginationSchema.parse({
        limit: '20',
        offset: '10',
      });
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(10);
    });

    it('should cap limit at 100 (DoS prevention)', () => {
      const result = paginationSchema.safeParse({ limit: 1000 });
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const result = paginationSchema.safeParse({ offset: -1 });
      expect(result.success).toBe(false);
    });
  });
});
