import { Nursery } from "../nursery/nursery.js";

type NurseryTuple = [string, Nursery];

export class Greenhouse {
  private _nurseries: NurseryTuple[] = [];

  constructor() {}

  addPromises(promises: Promise<unknown>[], deplay?: number) {
    this._nurseries.push([crypto.randomUUID(), new Nursery(promises, deplay)]);
  }
}

