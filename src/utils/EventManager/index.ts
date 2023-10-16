class EventManager {
  private listeners: {
    [event: string]: Array<(...args: any[]) => void>;
  } = {};

  emit(event: string, ...args: any[]) {
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
