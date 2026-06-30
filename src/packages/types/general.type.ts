export type UUID = `${string}-${string}-${string}-${string}-${string}`;

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