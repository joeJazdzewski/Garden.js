import type { UUID } from "../types/general.type.js";
import type { IFlow, EventListener } from "./interfaces/IFlows.js";

export class Flow implements IFlow {
  private _events = new Map<string, Event>();
  private _listeners = new Map<string, EventListener>();

  constructor(private _target: EventTarget = new EventTarget()) {}
  
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean, processPrevious: boolean = false): UUID | void {
    this._target.addEventListener(type, callback, options);
    if(processPrevious && this._events.has(type)) {
      const event = this._events.get(type);
      if (event) {
        if (callback instanceof Function) {
          callback(event);
        } else {
          (callback as EventListenerObject).handleEvent(event);
        }
      }
      return;
    }
    const key = crypto.randomUUID();
    this._listeners.set(key, { type, callback, options });

  }

  removeEventListener(id: UUID): void;
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(
    idOrType: UUID | string,
    callback?: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean
  ): void {
    if (this._listeners.has(idOrType as UUID)) {
      const id = idOrType as UUID;
      const listener = this._listeners.get(id);
      if (listener) {
        this._target.removeEventListener(listener.type, listener.callback, listener.options);
        this._listeners.delete(id);
      }
    } else {
      this._target.removeEventListener(idOrType, callback!, options);
    }
  }
  
  dispatchEvent(event: Event): void {
    this._events.set(event.type, event);
    this._target.dispatchEvent(event);
  }
}