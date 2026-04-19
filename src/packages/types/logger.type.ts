export type LoggerType = 'info' | 'error' | 'warn' | 'debug' | 'trace';

export type Logger = {
  [key in LoggerType]: (...args: unknown[]) => void;
}