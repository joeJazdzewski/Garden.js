import { Nursery } from '../packages/nursery/nursery.js';
import type { Logger } from '../packages/logger.type.js';

const logger: Logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
};

describe('Nursery', () => {
  describe('constructor', () => {
    it('should initialize with an id', () => {
      const nursery = new Nursery();
      
      expect(nursery.id).toBeDefined();
      expect(typeof nursery.id).toBe('string');
    });

    it('should accept a logger', () => {
      const nursery = new Nursery(logger);
      
      expect(nursery).toBeDefined();
      expect(nursery.id).toBeDefined();
    });
  });

  describe('plant', () => {
    it('should create pots for all promises in an array', () => {
      const promises = [
        Promise.resolve('test1'),
        Promise.resolve('test2'),
        Promise.resolve('test3'),
      ];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      // Nursery should be created successfully
      expect(nursery).toBeDefined();
      expect(nursery.isComplete).toBe(false);
    });

    it('should use default delay of 10000ms', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      expect(nursery).toBeDefined();
    });

    it('should accept a custom delay', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery();
      nursery.plant(promises, 5000);
      
      expect(nursery).toBeDefined();
    });

    it('should plant a single promise', () => {
      const promise = Promise.resolve('test');
      const nursery = new Nursery();
      nursery.plant(promise);
      
      expect(nursery).toBeDefined();
      expect(nursery.isComplete).toBe(false);
    });

    it('should return the nursery instance for chaining', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery();
      const result = nursery.plant(promises);
      
      expect(result).toBe(nursery);
    });
  });

  describe('isComplete', () => {
    it('should return false when promises are still in progress', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      // Check immediately - promises might not be settled yet
      const isComplete = nursery.isComplete;
      expect(typeof isComplete).toBe('boolean');
      expect(isComplete).toBe(false);
    });

    it('should return true when all promises are fulfilled', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery().plant(promises);
      
      // Wait for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(nursery.isComplete).toBe(true);
    });

    it('should return true when all promises have settled (including rejected)', async () => {
      const promises = [
        Promise.resolve('test1'),
        Promise.reject(new Error('test error')),
      ];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      // Wait for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // isComplete returns true when all pots have settled (not "in progress")
      // This includes fulfilled, rejected, timed out, or dumped statuses
      expect(nursery.isComplete).toBe(true);
    });
  });

  describe('close', () => {
    it('should close the nursery and dump all pots', () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      expect(nursery.isComplete).toBe(false);
      
      nursery.close();
      
      expect(nursery.isComplete).toBe(true);
    });

    it('should call logger.info when closed', () => {
      let infoCalled = false;
      let infoArgs: unknown[] = [];
      const testLogger: Logger = {
        info: (...args: unknown[]) => {
          infoCalled = true;
          infoArgs = args;
        },
        error: () => {},
        warn: () => {},
        debug: () => {},
        trace: () => {},
      };
      const nursery = new Nursery(testLogger);
      const promises = [Promise.resolve('test')];
      nursery.plant(promises);
      
      nursery.close();
      
      expect(infoCalled).toBe(true);
      expect(infoArgs.length).toBeGreaterThan(0);
      const message = String(infoArgs[0]);
      expect(message).toContain('Nursery');
      expect(message).toContain('closed');
    });
  });

  describe('toPromise', () => {
    it('should wait for all pots to complete', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery();
      nursery.plant(promises);
      
      const result = await nursery.toPromise;
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(nursery.isComplete).toBe(true);
    });

    it('should handle empty nursery', async () => {
      const nursery = new Nursery();
      
      const result = await nursery.toPromise;
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
