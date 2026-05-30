import { Nursery } from './nursery.js';
import type { Message } from '../messaging/latest-message.worker.js';
import type { LatestMessageWorker } from '../messaging/latest-message-worker.js';
import type { Logger } from '../../types/logger.type.js';

const logger: Logger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
};

function createMockMessaging(): LatestMessageWorker {
  const listeners = new Map<string, ((value: unknown) => void)[]>();

  return {
    load: async () => {},
    isReady: () => true,
    shutdown: () => {},
    getLatestMessage: () => undefined,
    addListener: (name: string, callback: (value: unknown) => void) => {
      const callbacks = listeners.get(name) ?? [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    send: <T>(message: Message<T>) => {
      listeners.get(message.kind)?.forEach((callback) => callback(message.payload));
    },
  } as LatestMessageWorker;
}

describe('Nursery', () => {
  describe('constructor', () => {
    it('should initialize with an id', () => {
      const nursery = new Nursery(createMockMessaging());

      expect(nursery.id).toBeDefined();
      expect(typeof nursery.id).toBe('string');
    });

    it('should accept a logger', () => {
      const nursery = new Nursery(createMockMessaging(), logger);

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
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      expect(nursery).toBeDefined();
      expect(nursery.isComplete).toBe(false);
    });

    it('should use default delay of 10000ms', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      expect(nursery).toBeDefined();
    });

    it('should accept a custom delay', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises, 5000);

      expect(nursery).toBeDefined();
    });

    it('should plant a single promise', () => {
      const promise = Promise.resolve('test');
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promise);

      expect(nursery).toBeDefined();
      expect(nursery.isComplete).toBe(false);
    });

    it('should return the nursery instance for chaining', () => {
      const promises = [Promise.resolve('test')];
      const nursery = new Nursery(createMockMessaging());
      const result = nursery.plant(promises);

      expect(result).toBe(nursery);
    });
  });

  describe('isComplete', () => {
    it('should return false when promises are still in progress', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      const isComplete = nursery.isComplete;
      expect(typeof isComplete).toBe('boolean');
      expect(isComplete).toBe(false);
    });

    it('should return true when all promises are fulfilled', async () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(createMockMessaging()).plant(promises);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(nursery.isComplete).toBe(true);
    });

    it('should return true when all promises have settled (including rejected)', async () => {
      const promises = [
        Promise.resolve('test1'),
        Promise.reject(new Error('test error')),
      ];
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(nursery.isComplete).toBe(true);
    });
  });

  describe('shutdown', () => {
    it('should close the nursery and dump all pots', () => {
      const promises = [Promise.resolve('test1'), Promise.resolve('test2')];
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      expect(nursery.isComplete).toBe(false);

      nursery.shutdown();

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
      const nursery = new Nursery(createMockMessaging(), testLogger);
      const promises = [Promise.resolve('test')];
      nursery.plant(promises);

      nursery.shutdown();

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
      const nursery = new Nursery(createMockMessaging());
      nursery.plant(promises);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await nursery.toPromise;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(nursery.isComplete).toBe(true);
    });

    it('should handle empty nursery', async () => {
      const nursery = new Nursery(createMockMessaging());

      const result = await nursery.toPromise;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
