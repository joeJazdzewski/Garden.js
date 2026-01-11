import type { Logger } from "../logger.type.js"

type PotInProgress = {
  status: "in progress"
}

type PottTimedOut = {
  status: "timed out"
}

type PotDumped = {
  status: "dumped"
}

export type Potted<T> = PromiseSettledResult<T> | PotInProgress | PottTimedOut | PotDumped

export class Pot<T> {

  private _value: Potted<T> = { status: 'in progress' };
  private ignoreResult = false;
  private timeoutId: NodeJS.Timeout | null = null;
  private completionResolver: ((value: Potted<T>) => void) | null = null;
  private completionPromise: Promise<Potted<T>> | null = null;
  public id = crypto.randomUUID();
  public createdCallStack: string = "";

  constructor(private logger?: Logger) {}

  private set value(value: Potted<T>) {
    this._value = value;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.completionResolver && value.status !== 'in progress') {
      this.completionResolver(value);
      this.completionResolver = null;
      this.completionPromise = null;
    }
  }

  get value(): Potted<T> {
    return this._value;
  }

  async wait(): Promise<Potted<T>> {
    if (this._value.status !== 'in progress') {
      return this._value;
    }

    if (this.completionPromise) {
      return this.completionPromise;
    }

    // Create a new promise for waiting
    this.completionPromise = new Promise<Potted<T>>((resolve) => {
      this.completionResolver = resolve;
    });

    return this.completionPromise;
  }


  plant(promise: Promise<T>, delay: number = 10000): Pot<T> {
    this.createdCallStack = new Error().stack || "";
    this.logger?.info(`[Greenhouse:Pot:${this.id}]`, `Pot planted with delay ${delay}ms`, this.createdCallStack)
    
    this.timeoutId = setTimeout(() => {
      this.value = { status: 'timed out' };
      this.logger?.warn(`[Greenhouse:Pot:${this.id}]`, `Pot timed out after ${delay}ms`, this.createdCallStack)
      this.ignoreResult = true;
    }, delay);

    Promise.allSettled([promise]).then((results) => {
      if (this.ignoreResult) return;
      this.value = results[0];
    }).catch((error) => {
      if (this.ignoreResult) return;
      this.value = { status: 'rejected', reason: error };
      this.logger?.error(`[Greenhouse:Pot:${this.id}]`, error);
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