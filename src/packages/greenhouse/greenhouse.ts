import { Nursery } from "../nursery/nursery.js";
import type { Logger } from "../logger.type.js";

type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export class Greenhouse {
  private _nurseries: Map<Uuid, Nursery> = new Map<Uuid, Nursery>();

  constructor(private logger?: Logger) {}

  public addPromises(promises: Promise<unknown>[], deplay?: number): Nursery {
    const nursery = new Nursery(this.logger).plant(promises, deplay);

    nursery.toPromise.then(() => {
      this.logger?.info(`Nursery ${nursery.id} completed`);
      this._nurseries.delete(nursery.id);
    });

    this._nurseries.set(crypto.randomUUID(), nursery);

    return nursery;
  }

  public closeNursery(id: Uuid): void {
    const nursery = this._nurseries.get(id);
    nursery?.close();
  }

  public async toPromise(): Promise<void> {
    const promises = this.nurseries.map(nursery => nursery.toPromise);
    await Promise.all(promises);
    this._nurseries = new Map<Uuid, Nursery>();
  }

  public get nurseries(): Nursery[] {
    return [...this._nurseries.values()];
  }

  public getNursery(id: Uuid): Nursery | undefined {
    return this._nurseries.get(id);
  }
}

