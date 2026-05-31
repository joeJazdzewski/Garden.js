import { Flow } from './flow.js';

describe('Flow', () => {
  describe('constructor', () => {
    it('should start with no current value', () => {
      const flow = new Flow<number>();

      expect(flow.get()).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should store the current value', () => {
      const flow = new Flow<string>();
      flow.set('hello');

      expect(flow.get()).toBe('hello');
    });

    it('should replace the current value on subsequent sets', () => {
      const flow = new Flow<number>();
      flow.set(1);
      flow.set(2);

      expect(flow.get()).toBe(2);
    });

    it('should return the flow instance for chaining', () => {
      const flow = new Flow<number>();
      const result = flow.set(42);

      expect(result).toBe(flow);
      expect(flow.get()).toBe(42);
    });
  });

  describe('get', () => {
    it('should return undefined before any value is set', () => {
      const flow = new Flow<boolean>();

      expect(flow.get()).toBeUndefined();
    });

    it('should return the latest set value', () => {
      const flow = new Flow<string>();
      flow.set('first');
      flow.set('second');

      expect(flow.get()).toBe('second');
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers when a value is set', () => {
      const flow = new Flow<number>();
      const received: (number | undefined)[] = [];
      flow.subscribe((val) => received.push(val));

      flow.set(10);

      expect(received).toEqual([10]);
    });

    it('should notify subscribers on every set', () => {
      const flow = new Flow<number>();
      const received: (number | undefined)[] = [];
      flow.subscribe((val) => received.push(val));

      flow.set(1);
      flow.set(2);
      flow.set(3);

      expect(received).toEqual([1, 2, 3]);
    });

    it('should not replay past values by default', () => {
      const flow = new Flow<string>();
      flow.set('before');

      const received: (string | undefined)[] = [];
      flow.subscribe((val) => received.push(val));

      expect(received).toEqual([]);
    });

    it('should replay all past values when replay is true', () => {
      const flow = new Flow<number>();
      flow.set(1);
      flow.set(2);
      flow.set(3);

      const received: (number | undefined)[] = [];
      flow.subscribe((val) => received.push(val), true);

      expect(received).toEqual([1, 2, 3]);
    });

    it('should notify multiple subscribers', () => {
      const flow = new Flow<string>();
      const first: (string | undefined)[] = [];
      const second: (string | undefined)[] = [];
      flow.subscribe((val) => first.push(val));
      flow.subscribe((val) => second.push(val));

      flow.set('shared');

      expect(first).toEqual(['shared']);
      expect(second).toEqual(['shared']);
    });

    it('should deliver future values after subscribing with replay', () => {
      const flow = new Flow<number>();
      flow.set(1);

      const received: (number | undefined)[] = [];
      flow.subscribe((val) => received.push(val), true);

      flow.set(2);

      expect(received).toEqual([1, 2]);
    });
  });
});
