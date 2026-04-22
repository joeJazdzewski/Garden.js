import type { Message } from "./latest-message.worker.js";
import { Deferred } from "../utils/Deferred.js"

interface ILoadable {
  load(): Promise<void>;
}

interface IShutdownable {
  shutdown(): void;
}

interface IReadyable {
  isReady(): boolean;
}

type Undefinable<T> = T | undefined;

export class LatestMessageWorker implements ILoadable, IShutdownable, IReadyable {
  private _worker: Worker | undefined;
  private _eventMap = new Map<string, Undefinable<unknown>>();
  private _callbackMap = new Map<string, ((value: unknown) => void)[]>();
  private _isReady = false

  constructor() {
    
  }

  getLatestMessage<T>(name: string): Undefinable<T> {
    return this._eventMap.get(name) as T;
  }

  addListener(name: string, callback: (value: unknown) => void, getLastest = false): void {    
    if (!this._eventMap.has(name)) {
      this._eventMap.set(name, undefined)
    } 

    if (!this._callbackMap.has(name)) {
      this._callbackMap.set(name, [callback])
    } else {
      const callbacks = this._callbackMap.get(name)!;
      callbacks?.push(callback);
      this._callbackMap.set(name, callbacks);
    }

    if(getLastest) {
      const value = this._eventMap.get(name);
      callback(value);
    }
  }

  send<T>(message: Message<T>): void {
    this._worker?.postMessage(message);
  }

  load(): Promise<void> {
    const defer = new Deferred<void>();
    
    this._worker = new Worker(new URL("./latest-message.worker.js", import.meta.url), {
      type: "module",
    });

    this._worker.onmessage = (event: MessageEvent<Message<unknown>>): void => {
      const data = event.data;

      if (!data) {
        return;
      }

      if (data.kind === "ready") {
        this._isReady = true;
        defer.resolve();
        return;
      }

      this._eventMap.set(data.kind, data.payload);
      const callbacks = this._callbackMap.get(data.kind);
      callbacks?.forEach(fn => fn(data.payload))
    };
    this._sendReadySignal();
    return defer.promise;
  }

  private _sendReadySignal(): void {
    this._worker?.postMessage({ kind: "ready", payload: { name: "signal-ready" } });
  }

  shutdown(): void {
    this._worker?.terminate();
  }

  isReady(): boolean {
    return this._isReady;
  }
}
