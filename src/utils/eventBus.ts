type EventMap = {
  TimerFinished: { mode: string };
};

type EventKey = keyof EventMap;

class EventBus {
  private listeners: { [key: string]: Function[] } = {};

  on<K extends EventKey>(key: K, handler: (detail: EventMap[K]) => void) {
    if (!this.listeners[key]) this.listeners[key] = [];

    this.listeners[key].push(handler);
  }

  off<K extends EventKey>(key: K, handler: (detail: EventMap[K]) => void) {
    const index = this.listeners[key]?.indexOf(handler);
    if (index !== undefined && index !== -1) {
      this.listeners[key].splice(index, 1);
    }
  }

  emit<K extends EventKey>(key: K, detail: EventMap[K]) {
    this.listeners[key]?.forEach((handler) => handler(detail));
  }
}

export const eventBus = new EventBus();