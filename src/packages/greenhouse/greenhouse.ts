import { Nursery } from "../nursery/nursery.js";
import type { Logger } from "../logger.type.js";

type NurseryTuple = [string, Nursery];

export class Greenhouse {
  private _nurseries: NurseryTuple[] = [];

  constructor(private logger?: Logger) {}

  public addPromises(promises: Promise<unknown>[], deplay?: number) {

    const nursery = new Nursery(promises, deplay);

    nursery.toPromise.then(() => {
      this.logger?.info(`Nursery ${nursery.id} completed`);
      this._nurseries.splice(this._nurseries.indexOf([nursery.id, nursery]), 1);
    });

    this._nurseries.push([crypto.randomUUID(), new Nursery(promises, deplay)]);
  }

  public async toPromise(): Promise<void> {
    const promises = this._nurseries.map(([_, nursery]) => nursery.toPromise);
    await Promise.all(promises);
    this._nurseries = [];
  }

  public get activeNurseries(): NurseryTuple[] {
    return this._nurseries;
  }
}

