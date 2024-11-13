type AuthEventType = "logout" | "login" | "refresh";

class AuthEvents {
  private subscribers: ((type: AuthEventType) => void)[] = [];

  subscribe(callback: (type: AuthEventType) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  emit(type: AuthEventType = "logout") {
    this.subscribers.forEach((callback) => callback(type));
  }
}

export const authEvents = new AuthEvents();
