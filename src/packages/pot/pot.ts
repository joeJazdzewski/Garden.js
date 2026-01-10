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
    })
  }

  private set value(value: Potted<T>) {
    this.value = value;
    clearTimeout(this.timeoutId!);
    this.timeoutId = null;
  }

  get value(): Potted<T> {
    return this._value;
  }  
}