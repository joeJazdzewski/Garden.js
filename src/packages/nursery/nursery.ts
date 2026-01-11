import type { Logger } from "../logger.type.js";
import { Pot } from "../pot/pot.js"
import type { Potted } from "../pot/pot.js";

export class Nursery {

  id = crypto.randomUUID();

  private _pots: Pot<unknown>[] = [];

  constructor(private readonly logger?: Logger) {}

  get isComplete() {
    return this._pots.every((pot) => pot.value.status !== "in progress");
  }

  get toPromise(): Promise<Potted<unknown>[]> {
    return Promise.all(this._pots.map((pot) => pot.wait()));
  }

  public plant(promise: Promise<unknown> | Promise<unknown>[], delay: number = 10000): Nursery {
    if(Array.isArray(promise)) {
      promise.forEach((p) => this._pots.push(new Pot(this.logger).plant(p, delay)));
    } else {
      this._pots.push(new Pot(this.logger).plant(promise, delay));
    }
    return this;
  }

  public close(): void {
    this._pots.forEach((pot) => pot.dump());
    this._pots = [];
    this.logger?.info(`Nursery ${this.id} closed`);
  }
}