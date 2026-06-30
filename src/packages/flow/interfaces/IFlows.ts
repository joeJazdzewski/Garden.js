type GUID = `${string}-${string}-${string}-${string}`;

export interface IFlow<T> {
  addListener(callback: (val: T) => void, processPrevious:boolean): GUID;
  waitFor(id: GUID): Promise<void>;
  update(val: T): void
}