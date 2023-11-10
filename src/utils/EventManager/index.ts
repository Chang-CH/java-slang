export enum EventType {
  LOAD_CLASS = 'load class',
  EXCEPTION = 'exception',
  INSTRUCTION = 'instruction',
  INVOKE = 'invoke',
  RETURN = 'return',
}

class EventManager {
  private listeners: {
    [event: string]: Array<(...args: any[]) => void>;
  } = {};

  emit(event: EventType, ...args: any[]) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach(listener => listener(...args));
  }

  onEvent(event: string, listener: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
  }
}

const eventManager = new EventManager();
export default eventManager;
