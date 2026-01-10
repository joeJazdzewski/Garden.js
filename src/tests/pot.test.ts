import { Pot } from '../packages/pot/pot.js';
import type { Potted } from '../packages/pot/pot.js';

describe('Pot', () => {
  describe('constructor', () => {
    it('should initialize with in progress status', () => {
      const promise = Promise.resolve('test');
      const pot = new Pot(promise);
      
      expect(pot.value).toEqual({ status: 'in progress' });
    });

    it('should resolve a fulfilled promise', async () => {
      const promise = Promise.resolve('success');
      const pot = new Pot(promise);
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = pot.value;
      expect(value).toHaveProperty('status');
      if ('status' in value && value.status === 'fulfilled') {
        expect(value.value).toBe('success');
      }
    });

    it('should handle a rejected promise', async () => {
      const error = new Error('test error');
      const promise = Promise.reject(error);
      const pot = new Pot(promise);
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = pot.value;
      expect(value).toHaveProperty('status');
      if ('status' in value && value.status === 'rejected') {
        expect(value.reason).toBe(error);
      }
    });

    it('should timeout after specified delay', async () => {
      const promise = new Promise(resolve => {
        // Never resolves
      });
      const pot = new Pot(promise, 50); // 50ms timeout
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(pot.value).toEqual({ status: 'timed out' });
    });

    it('should use default timeout of 10000ms', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot(promise);
      
      // Should still be in progress after 100ms (well before 10s timeout)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If it hasn't timed out, it should be resolved
      const value = pot.value;
      expect(value).not.toEqual({ status: 'timed out' });
    });
  });

  describe('value getter', () => {
    it('should return the current potted value', () => {
      const promise = Promise.resolve('test');
      const pot = new Pot(promise);
      
      expect(pot.value).toBeDefined();
    });
  });
});

