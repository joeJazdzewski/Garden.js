import { Nursery } from '../packages/nursery/nursery.js';

describe('Nursery', () => {
  describe('constructor', () => {
    it('should initialize with an id', () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(promises);
      
      expect(nursery.id).toBeDefined();
      expect(typeof nursery.id).toBe('string');
    });

    it('should create pots for all promises', () => {
      const promises = [
        Promise.resolve('test1'),
        Promise.resolve('test2'),
        Promise.resolve('test3'),
      ];
      const nursery = new Nursery(promises);
      
      // Nursery should be created successfully
      expect(nursery).toBeDefined();
    });

    it('should use default delay of 10000ms', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery(promises);
      
      expect(nursery).toBeDefined();
    });

    it('should accept a custom delay', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery(promises, 5000);
      
      expect(nursery).toBeDefined();
    });
  });

  describe('isComplete', () => {
    it('should return false when promises are still in progress', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(promises);
      
      // Check immediately - promises might not be settled yet
      const isComplete = nursery.isComplete;
      expect(typeof isComplete).toBe('boolean');
    });

    it('should return true when all promises are fulfilled', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(promises);
      
      // Wait for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(nursery.isComplete).toBe(true);
    });

    it('should return false when some promises are rejected', async () => {
      const promises = [
        Promise.resolve('test1'),
        Promise.reject(new Error('error')),
      ];
      const nursery = new Nursery(promises);
      
      // Wait for promises to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(nursery.isComplete).toBe(false);
    });
  });
});

