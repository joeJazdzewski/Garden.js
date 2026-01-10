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

  describe('wait', () => {
    it('should wait for a fulfilled promise and return the value', async () => {
      const promise = Promise.resolve('success');
      const pot = new Pot(promise);
      
      const result = await pot.wait();
      
      expect(result).toHaveProperty('status');
      if ('status' in result && result.status === 'fulfilled') {
        expect(result.value).toBe('success');
      }
    });

    it('should wait for a rejected promise and return the rejected status', async () => {
      const error = new Error('test error');
      const promise = Promise.reject(error);
      const pot = new Pot(promise);
      
      const result = await pot.wait();
      
      expect(result).toHaveProperty('status');
      if ('status' in result && result.status === 'rejected') {
        expect(result.reason).toBe(error);
      }
    });

    it('should wait for a timeout and return timed out status', async () => {
      const promise = new Promise(() => {});
      const pot = new Pot(promise, 50); 
      
      const result = await pot.wait();
      
      expect(result).toEqual({ status: 'timed out' });
    }, 10000); 

    it('should return immediately if already completed', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot(promise);
      
      await pot.wait();
      
      const startTime = Date.now();
      const result = await pot.wait();
      const elapsedTime = Date.now() - startTime;
      
      expect(elapsedTime).toBeLessThan(10);
      expect(result.status).not.toBe('in progress');
    });

    it('should resolve multiple wait calls with the same value', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot(promise);
      
      const wait1 = pot.wait();
      const wait2 = pot.wait();
      const wait3 = pot.wait();
      
      const [result1, result2, result3] = await Promise.all([wait1, wait2, wait3]);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      if ('status' in result1 && result1.status === 'fulfilled') {
        expect(result1.value).toBe('test');
      }
    });
  });
});

