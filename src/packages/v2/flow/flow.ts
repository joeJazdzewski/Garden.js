export class Flow<T> {
  private _allValues: T[] = [];
  private _currentValue: T | undefined;
  private _subscribers: ((val: T | undefined) => void)[] = [];

  public constructor() {}

  public set(val: T): Flow<T> {
    this._allValues.push(val);
    this._currentValue = val;
    this._subscribers.forEach((fn) => fn(val));
    return this;
  }

  public get(): T | undefined {
    return this._currentValue;
  }

  public subscribe(fun: (val: T | undefined) => void, replay = false) {
    this._subscribers.push(fun);
    if (replay) {
      this._allValues.forEach((val) => fun(val));
    }
  }
}