export interface ILoadable {
  load(): Promise<void>;
}

export interface IShutdownable {
  shutdown(): void;
}

export interface IReadyable {
  isReady(): boolean;
}