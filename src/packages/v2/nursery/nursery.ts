import type { Potted } from "../../types/general.type.js";
import type { Logger } from "../../types/logger.type.js";
import { LatestMessageWorker } from "../messaging/latest-message-worker.js"
import { Pot } from "../pot/pot.js";
import type { ILoadable, IReadyable, IShutdownable } from "../types.js"
export class Nursery implements ILoadable, IReadyable, IShutdownable {
  
  id = crypto.randomUUID();

  private _pots: Pot<unknown>[] = [];

  get isComplete() {
    return this._pots.every((pot) => pot.value.status !== "in progress");
  }

  get toPromise(): Promise<Potted<unknown>[]> {
    return Promise.all(this._pots.map((pot) => pot.wait()));
  }
  
  constructor(private _messaging: LatestMessageWorker, private readonly _logger?: Logger) {}

  async load(): Promise<void> {
    return this._messaging.load();
  }

  isReady(): boolean {
    return this._messaging.isReady();
  }

  shutdown(): void {
    this._messaging.shutdown();

    this._pots.forEach((pot) => pot.dump());
    this._pots = [];
    this._logger?.info(`Nursery ${this.id} closed`);
  }

  public plant(promise: Promise<unknown> | Promise<unknown>[], delay: number = 10000): Nursery {
    if(Array.isArray(promise)) {
      promise.forEach((p) => this._pots.push(new Pot(this._messaging, this._logger).plant(p, delay)));
    } else {
      this._pots.push(new Pot(this._messaging, this._logger).plant(promise, delay));
    }
    return this;
  }
}