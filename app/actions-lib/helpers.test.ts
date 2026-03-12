import { describe, it, expect } from 'vitest';
import { slugify, isSlugConflict } from './helpers';

describe('helpers', () => {
  describe('slugify', () => {
    it('should convert strings to lowercase and replace spaces with hyphens', () => {
      expect(slugify('New React Task')).toBe('new-react-task');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello World! @2026 #AI')).toBe('hello-world-2026-ai');
    });

    it('should trim hyphens from the start and end', () => {
      expect(slugify('---hello world---')).toBe('hello-world');
    });

    it('should handle multiple consecutive non-alphanumeric characters', () => {
      expect(slugify('react / next.js (awesome)')).toBe('react-next-js-awesome');
    });

    it('should return an empty string if input contains only special characters', () => {
      expect(slugify('!!! @@@ ###')).toBe('');
    });
  });

  describe('isSlugConflict', () => {
    it('should return true if error code is 23505 (PostgreSQL unique violation)', () => {
      const error = { code: '23505', message: 'Something went wrong' };
      expect(isSlugConflict(error)).toBe(true);
    });

    it('should return true if message contains "duplicate key"', () => {
      const error = { code: 'P0001', message: 'duplicate key value violates unique constraint' };
      expect(isSlugConflict(error)).toBe(true);
    });

    it('should return true if message contains "(slug)"', () => {
      const error = { code: null, message: 'Key (slug)=(my-task) already exists' };
      expect(isSlugConflict(error)).toBe(true);
    });

    it('should return false for unrelated errors', () => {
      const error = { code: '42P01', message: 'relation "tasks" does not exist' };
      expect(isSlugConflict(error)).toBe(false);
    });

    it('should handle empty or null error objects safely', () => {
      expect(isSlugConflict({})).toBe(false);
      expect(isSlugConflict({ code: null, message: null })).toBe(false);
    });
  });
});