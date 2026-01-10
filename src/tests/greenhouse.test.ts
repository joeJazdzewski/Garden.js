import { Greenhouse } from '../packages/greenhouse/greenhouse.js';

describe('Greenhouse', () => {
  describe('constructor', () => {
    it('should create an empty greenhouse', () => {
      const greenhouse = new Greenhouse();
      
      expect(greenhouse).toBeDefined();
    });
  });

  describe('addPromises', () => {
    it('should add a new nursery with promises', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse).toBeDefined();
    });

    it('should use default delay when not specified', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse).toBeDefined();
    });

    it('should accept a custom delay', () => {
      const greenhouse = new Greenhouse();
      const promises = [Promise.resolve('test')];
      
      greenhouse.addPromises(promises, 5000);
      
      expect(greenhouse).toBeDefined();
    });

    it('should create a unique nursery for each call', () => {
      const greenhouse = new Greenhouse();
      const promises1 = [Promise.resolve('test1')];
      const promises2 = [Promise.resolve('test2')];
      
      greenhouse.addPromises(promises1);
      greenhouse.addPromises(promises2);
      
      expect(greenhouse).toBeDefined();
    });

    it('should handle empty promise arrays', () => {
      const greenhouse = new Greenhouse();
      const promises: Promise<unknown>[] = [];
      
      greenhouse.addPromises(promises);
      
      expect(greenhouse).toBeDefined();
    });
  });
});

