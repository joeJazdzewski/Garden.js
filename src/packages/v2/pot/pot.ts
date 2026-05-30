import type { Logger } from "../../types/logger.type.js"
import type { Potted } from "../../types/general.type.js"
import type { LatestMessageWorker } from "../messaging/latest-message-worker.js"
import type { Deferred } from "../utils/Deferred.js";

export class Pot<T> {

  private _value: Potted<T> = { status: 'in progress' };
  private _defer: Deferred<void> | undefined = undefined;
  private ignoreResult = false;
  private timeoutId: NodeJS.Timeout | null = null;
  public id = crypto.randomUUID();
  public createdCallStack: string = "";

  constructor(private _messager: LatestMessageWorker, private _logger?: Logger) {}

  private set value(value: Potted<T>) {
    this._value = value;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this._messager.addListener(crypto.randomUUID(), (val: unknown) => {
      if(!this.ignoreResult) {
        this._value = { status: "fulfilled", value: val as T};  
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
      }
    });
  }

  get value(): Potted<T> {
    return this._value;
  }

  async wait(): Promise<Potted<T>> {
    if (this._defer) {
      await this._defer;
    }

    return this._value;
  }


  plant(promise: Promise<T>, delay: number = 10000): Pot<T> {
    this.createdCallStack = new Error().stack || "";
    this._logger?.info(`[Greenhouse:Pot:${this.id}]`, `Pot planted with delay ${delay}ms`, this.createdCallStack)
    
    this.timeoutId = setTimeout(() => {
      this.value = { status: 'timed out' };
      this._logger?.warn(`[Greenhouse:Pot:${this.id}]`, `Pot timed out after ${delay}ms`, this.createdCallStack)
      this.ignoreResult = true;
    }, delay);

    Promise.allSettled([promise]).then((results) => {
      if (this.ignoreResult) return;
      this.value = results[0];
      this._messager.send<Potted<T>>({ kind: this.id, payload: this.value });
    }).catch((error) => {
      if (this.ignoreResult) return;
      this.value = { status: 'rejected', reason: error };
      this._messager.send<Potted<T>>({ kind: this.id, payload: this.value });
      this._logger?.error(`[Greenhouse:Pot:${this.id}]`, error);
    });

    return this
  }

  dump(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.ignoreResult = true;
    this.value = { status: 'dumped' };
  }
}