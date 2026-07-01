import type { UUID } from "../../types/general.type.js"

export interface IFlow {
  addEventListener(type:string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean, processPrevious?: boolean): UUID | void;
  dispatchEvent(event: Event): void;
  removeEventListener(id: UUID):  void;
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
}

export type EventListener = {
  type: string;
  callback: EventListenerOrEventListenerObject | null;
  options?: AddEventListenerOptions | boolean | undefined;
}
