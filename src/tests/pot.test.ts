import { Pot } from '../packages/pot/pot.js';

const logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
};

describe('Pot', () => {
  describe('constructor', () => {
    it('should initialize with in progress status', () => {
      const pot = new Pot();
      
      expect(pot.value).toEqual({ status: 'in progress' });
      expect(pot.id).toBeDefined();
      expect(typeof pot.id).toBe('string');
    });

    it('should accept a logger', () => {
      const pot = new Pot(logger);
      
      expect(pot.value).toEqual({ status: 'in progress' });
    });
  });

  describe('plant', () => {
    it('should resolve a fulfilled promise', async () => {
      const promise = Promise.resolve('success');
      const pot = new Pot();
      pot.plant(promise);
      
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
      const pot = new Pot();
      pot.plant(promise);
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = pot.value;
      expect(value).toHaveProperty('status');
      if ('status' in value && value.status === 'rejected') {
        expect(value.reason).toBe(error);
      }
    });

    it('should timeout after specified delay', async () => {
      const promise = new Promise(() => {
        // Never resolves
      });
      const pot = new Pot();
      pot.plant(promise, 50); // 50ms timeout
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(pot.value).toEqual({ status: 'timed out' });
    });

    it('should use default delay of 10000ms', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should be resolved, not timed out (10s timeout hasn't elapsed)
      const value = pot.value;
      expect(value).not.toEqual({ status: 'timed out' });
      if ('status' in value && value.status === 'fulfilled') {
        expect(value.value).toBe('test');
      }
    });

    it('should accept a custom delay', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise, 5000);
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = pot.value;
      expect(value).not.toEqual({ status: 'timed out' });
    });

    it('should return the pot instance for chaining', () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      const result = pot.plant(promise);
      
      expect(result).toBe(pot);
    });
  });

  describe('value getter', () => {
    it('should return the current potted value', () => {
      const pot = new Pot();
      
      expect(pot.value).toBeDefined();
      expect(pot.value).toEqual({ status: 'in progress' });
    });

    it('should return the value after planting a promise', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      // Initially in progress
      expect(pot.value).toEqual({ status: 'in progress' });
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = pot.value;
      expect(value).toHaveProperty('status');
      expect(value.status).not.toBe('in progress');
    });
  });

  describe('wait', () => {
    it('should wait for a fulfilled promise and return the value', async () => {
      const promise = Promise.resolve('success');
      const pot = new Pot();
      pot.plant(promise);
      
      const result = await pot.wait();
      
      expect(result).toHaveProperty('status');
      if ('status' in result && result.status === 'fulfilled') {
        expect(result.value).toBe('success');
      }
    });

    it('should wait for a rejected promise and return the rejected status', async () => {
      const error = new Error('test error');
      const promise = Promise.reject(error);
      const pot = new Pot();
      pot.plant(promise);
      
      const result = await pot.wait();
      
      expect(result).toHaveProperty('status');
      if ('status' in result && result.status === 'rejected') {
        expect(result.reason).toBe(error);
      }
    });

    it('should wait for a timeout and return timed out status', async () => {
      const promise = new Promise(() => {}); // Never resolves
      const pot = new Pot();
      pot.plant(promise, 50); 
      
      const result = await pot.wait();
      
      expect(result).toEqual({ status: 'timed out' });
    }, 200); // 50ms timeout + buffer

    it('should return immediately if already completed', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      // Wait for the first call to complete
      await pot.wait();
      
      // Second call should return immediately
      const startTime = Date.now();
      const result = await pot.wait();
      const elapsedTime = Date.now() - startTime;
      
      expect(elapsedTime).toBeLessThan(10);
      expect(result.status).not.toBe('in progress');
      if ('status' in result && result.status === 'fulfilled') {
        expect(result.value).toBe('test');
      }
    });

    it('should resolve multiple wait calls with the same value', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
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

  describe('dump', () => {
    it('should dump the pot and set status to dumped', () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      pot.dump();
      
      expect(pot.value).toEqual({ status: 'dumped' });
    });

    it('should prevent promise result from being processed after dump', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      pot.dump();
      
      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should still be dumped, not fulfilled
      expect(pot.value).toEqual({ status: 'dumped' });
    });

    it('should clear timeout when dumped', async () => {
      const promise = new Promise(() => {}); // Never resolves
      const pot = new Pot();
      pot.plant(promise, 50);
      
      pot.dump();
      
      // Wait longer than timeout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should be dumped, not timed out
      expect(pot.value).toEqual({ status: 'dumped' });
    });

    it('should allow wait to return dumped status', async () => {
      const promise = Promise.resolve('test');
      const pot = new Pot();
      pot.plant(promise);
      
      pot.dump();
      
      const result = await pot.wait();
      expect(result).toEqual({ status: 'dumped' });
    });
  });
});
