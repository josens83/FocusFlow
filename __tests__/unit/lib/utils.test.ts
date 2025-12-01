/**
 * @fileoverview Utility Functions 테스트
 *
 * @description
 * 유틸리티 함수들의 정확한 동작을 테스트합니다.
 */

import {
  cn,
  formatTime,
  formatMinutes,
  calculateLevel,
  calculateSessionRewards,
  getStreakBonus,
  generateId,
  getGreeting,
} from '@/lib/utils';

describe('Utility Functions', () => {
  // ==========================================================================
  // cn (className merger) Tests
  // ==========================================================================
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toBe('base included');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });
  });

  // ==========================================================================
  // formatTime Tests
  // ==========================================================================
  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('should handle edge cases', () => {
      expect(formatTime(1)).toBe('00:01');
      expect(formatTime(61)).toBe('01:01');
    });
  });

  // ==========================================================================
  // formatMinutes Tests
  // ==========================================================================
  describe('formatMinutes', () => {
    it('should format minutes correctly', () => {
      expect(formatMinutes(30)).toBe('30분');
      expect(formatMinutes(60)).toBe('1시간');
      expect(formatMinutes(90)).toBe('1시간 30분');
      expect(formatMinutes(120)).toBe('2시간');
    });

    it('should handle edge cases', () => {
      expect(formatMinutes(0)).toBe('0분');
      expect(formatMinutes(1)).toBe('1분');
      expect(formatMinutes(59)).toBe('59분');
    });
  });

  // ==========================================================================
  // calculateLevel Tests
  // ==========================================================================
  describe('calculateLevel', () => {
    it('should calculate level 1 for 0 experience', () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.progress).toBe(0);
    });

    it('should calculate level correctly', () => {
      // Level 2 needs 100 exp
      expect(calculateLevel(100).level).toBe(2);
      // Level 3 needs 400 exp
      expect(calculateLevel(400).level).toBe(3);
      // Level 4 needs 900 exp
      expect(calculateLevel(900).level).toBe(4);
    });

    it('should calculate progress within level', () => {
      // At 50 exp (halfway to level 2)
      const result = calculateLevel(50);
      expect(result.level).toBe(1);
      expect(result.progress).toBe(50);
    });

    it('should return next level exp requirement', () => {
      const result = calculateLevel(0);
      expect(result.nextLevelExp).toBe(100);
    });
  });

  // ==========================================================================
  // calculateSessionRewards Tests
  // ==========================================================================
  describe('calculateSessionRewards', () => {
    it('should calculate base rewards correctly', () => {
      // 25 minutes, 100% focus score
      const result = calculateSessionRewards(25, 100);
      expect(result.experience).toBe(25);
      expect(result.coins).toBe(12); // floor(25 * 0.5 * 1)
    });

    it('should apply focus score reduction', () => {
      // 25 minutes, 50% focus score
      const result = calculateSessionRewards(25, 50);
      expect(result.experience).toBe(12); // floor(25 * 0.5)
      expect(result.coins).toBe(6); // floor(25 * 0.5 * 0.5)
    });

    it('should apply multipliers', () => {
      const result = calculateSessionRewards(25, 100, { exp: 2, coin: 1.5 });
      expect(result.experience).toBe(50); // 25 * 2
      expect(result.coins).toBe(18); // floor(12 * 1.5)
    });

    it('should handle edge cases', () => {
      expect(calculateSessionRewards(0, 100).experience).toBe(0);
      expect(calculateSessionRewards(25, 0).experience).toBe(0);
    });
  });

  // ==========================================================================
  // getStreakBonus Tests
  // ==========================================================================
  describe('getStreakBonus', () => {
    it('should return 1 for streak < 7 days', () => {
      expect(getStreakBonus(0)).toBe(1);
      expect(getStreakBonus(6)).toBe(1);
    });

    it('should add 10% bonus per week', () => {
      expect(getStreakBonus(7)).toBe(1.1);
      expect(getStreakBonus(14)).toBe(1.2);
      expect(getStreakBonus(21)).toBe(1.3);
    });

    it('should cap at 50% bonus', () => {
      expect(getStreakBonus(35)).toBe(1.5);
      expect(getStreakBonus(100)).toBe(1.5);
    });
  });

  // ==========================================================================
  // generateId Tests
  // ==========================================================================
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set(Array(100).fill(null).map(() => generateId()));
      expect(ids.size).toBe(100);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // getGreeting Tests
  // ==========================================================================
  describe('getGreeting', () => {
    const originalDate = Date;

    afterEach(() => {
      global.Date = originalDate;
    });

    const mockHour = (hour: number) => {
      const mockDate = jest.fn(() => ({
        getHours: () => hour,
      }));
      global.Date = mockDate as unknown as typeof Date;
    };

    it('should return late night greeting for 0-5', () => {
      mockHour(3);
      expect(getGreeting()).toBe('늦은 밤이에요');
    });

    it('should return morning greeting for 6-11', () => {
      mockHour(9);
      expect(getGreeting()).toBe('좋은 아침이에요');
    });

    it('should return afternoon greeting for 12-17', () => {
      mockHour(14);
      expect(getGreeting()).toBe('좋은 오후예요');
    });

    it('should return evening greeting for 18-23', () => {
      mockHour(20);
      expect(getGreeting()).toBe('좋은 저녁이에요');
    });
  });
});
