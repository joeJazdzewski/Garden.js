type PotInProgress = {
  status: "in progress"
}

type PottTimedOut = {
  status: "timed out"
}

export type Potted<T> = PromiseSettledResult<T> | PotInProgress | PottTimedOut

export class Pot<T> {

  private _value: Potted<T> = { status: 'in progress' };

  private ignoreResult = false;

  private timeoutId: NodeJS.Timeout | null = null;

  private completionResolver: ((value: Potted<T>) => void) | null = null;
  private completionPromise: Promise<Potted<T>> | null = null;

  constructor(result: Promise<T>, delay: number = 10000) {
    this.timeoutId = setTimeout(() => {
      this.value = { status: 'timed out' };
      this.ignoreResult = true;
    }, delay);

    Promise.allSettled([result]).then((results) => {
      if (this.ignoreResult) return;
      this.value = results[0];
    }).catch((error) => {
      if (this.ignoreResult) return;
      this.value = { status: 'rejected', reason: error };
    });
  }

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
}