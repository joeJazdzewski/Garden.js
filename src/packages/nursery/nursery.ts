import { Pot } from "../pot/pot.js"

export class Nursery {

  id = crypto.randomUUID();

  private _pots: Pot<unknown>[] = [];

  constructor(pots: Promise<unknown>[], delay: number = 10000) {
    this._pots = pots.map((pot) => new Pot(pot, delay));
  }

  get isComplete() {
    return this._pots.every((pot) => pot.value.status === "fulfilled");
  }
}