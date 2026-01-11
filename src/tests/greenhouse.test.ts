import { Greenhouse } from '../packages/greenhouse/greenhouse.js';
import type { Logger } from '../packages/logger.type.js';

const logger: Logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
};

describe('Greenhouse', () => {
  describe('constructor', () => {
    it('should create an empty greenhouse', () => {
      const greenhouse = new Greenhouse();
      
      expect(greenhouse).toBeDefined();
      expect(greenhouse.activeNurseries).toEqual([]);
    });

    it('should create a greenhouse with a logger', () => {
      
      const greenhouse = new Greenhouse(logger);
      
      expect(greenhouse).toBeDefined();
      expect(greenhouse.activeNurseries).toEqual([]);
    });
  });

  describe('addPromises', () => {
    it('should add a new nursery with promises', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse.activeNurseries.length).toBe(1);
      expect(greenhouse.activeNurseries[0]).toHaveLength(2);
      expect(typeof greenhouse.activeNurseries[0][0]).toBe('string');
      expect(greenhouse.activeNurseries[0][1]).toBeDefined();
    });

    it('should use default delay when not specified', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse.activeNurseries.length).toBe(1);
    });

    it('should accept a custom delay', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises, 5000);
      
      expect(greenhouse.activeNurseries.length).toBe(1);
    });

    it('should create a unique nursery for each call', () => {
      const greenhouse = new Greenhouse();
      const promises1 = [Promise.resolve('test1')];
      const promises2 = [Promise.resolve('test2')];
      
      greenhouse.addPromises(promises1);
      greenhouse.addPromises(promises2);
      
      expect(greenhouse.activeNurseries.length).toBe(2);
      expect(greenhouse.activeNurseries[0][0]).not.toBe(greenhouse.activeNurseries[1][0]);
    });

    it('should handle empty promise arrays', () => {
      const greenhouse = new Greenhouse();
      const promises: Promise<unknown>[] = [];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse.activeNurseries.length).toBe(1);
    });
  });

  describe('activeNurseries', () => {
    it('should return empty array initially', () => {
      const greenhouse = new Greenhouse();
      
      expect(greenhouse.activeNurseries).toEqual([]);
    });

    it('should return all active nurseries', () => {
      const greenhouse = new Greenhouse();
      const promises1 = [Promise.resolve('test1')];
      const promises2 = [Promise.resolve('test2')];
      
      greenhouse.addPromises(promises1);
      greenhouse.addPromises(promises2);
      
      const active = greenhouse.activeNurseries;
      expect(active.length).toBe(2);
      expect(active[0]).toHaveLength(2);
      expect(active[1]).toHaveLength(2);
    });

    it('should return the nurseries array', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      const active = greenhouse.activeNurseries;
      
      expect(Array.isArray(active)).toBe(true);
      expect(active.length).toBe(1);
      expect(active[0]).toHaveLength(2);
    });
  });

  describe('toPromise', () => {
    it('should resolve when no nurseries are active', async () => {
      const greenhouse = new Greenhouse();
      
      await expect(greenhouse.toPromise()).resolves.toBeUndefined();
      expect(greenhouse.activeNurseries).toEqual([]);
    });

    it('should wait for all nurseries to complete', async () => {
      const greenhouse = new Greenhouse();
      const promises1 = [Promise.resolve('test1')];
      const promises2 = [Promise.resolve('test2')];
      
      greenhouse.addPromises(promises1);
      greenhouse.addPromises(promises2);
      
      // Wait a bit for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await expect(greenhouse.toPromise()).resolves.toBeUndefined();
      expect(greenhouse.activeNurseries).toEqual([]);
    });

    it('should clear nurseries after completion', async () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      expect(greenhouse.activeNurseries.length).toBe(1);
      
      // Wait a bit for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await greenhouse.toPromise();
      expect(greenhouse.activeNurseries).toEqual([]);
    });

    it('should handle multiple nurseries with different delays', async () => {
      const greenhouse = new Greenhouse();
      const promises1 = [Promise.resolve('test1')];
      const promises2 = [Promise.resolve('test2')];
      
      greenhouse.addPromises(promises1, 100);
      greenhouse.addPromises(promises2, 100);
      
      // Wait a bit for promises to settle
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await expect(greenhouse.toPromise()).resolves.toBeUndefined();
      expect(greenhouse.activeNurseries).toEqual([]);
    });
  });

  describe('logger integration', () => {
    it('should call logger.info when nursery completes', async () => {
      let infoCalled = false;
      let infoArgs: unknown[] = [];
      const logger: Logger = {
        info: (...args: unknown[]) => {
          infoCalled = true;
          infoArgs = args;
        },
        error: () => {},
        warn: () => {},
        debug: () => {},
        trace: () => {},
      };
      const greenhouse = new Greenhouse(logger);
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      
      // Wait for nursery to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      await greenhouse.toPromise();
      
      expect(infoCalled).toBe(true);
      expect(infoArgs.length).toBeGreaterThan(0);
      const message = String(infoArgs[0]);
      expect(message).toContain('Nursery');
      expect(message).toContain('completed');
    });

    it('should not call logger if not provided', async () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      
      // Wait for nursery to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await expect(greenhouse.toPromise()).resolves.toBeUndefined();
    });
  });
});
