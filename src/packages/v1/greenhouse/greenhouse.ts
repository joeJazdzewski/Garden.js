import { Nursery } from "../nursery/nursery.js";
import type { Logger } from "../../types/logger.type.js";
import type { UUID } from "../../types/general.type.js";


export class Greenhouse {
  private _nurseries: Map<UUID, Nursery> = new Map<UUID, Nursery>();

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

  public closeNursery(id: UUID): void {
    const nursery = this._nurseries.get(id);
    nursery?.close();
  }

  public async toPromise(): Promise<void> {
    const promises = this.nurseries.map(nursery => nursery.toPromise);
    await Promise.all(promises);
    this._nurseries = new Map<UUID, Nursery>();
  }

  public get nurseries(): Nursery[] {
    return [...this._nurseries.values()];
  }

  public getNursery(id: UUID): Nursery | undefined {
    return this._nurseries.get(id);
  }
}

