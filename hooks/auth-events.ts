type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: AuthEventListener[] = [];
  private static instance: AuthEventEmitter;

  private constructor() {}

  static getInstance(): AuthEventEmitter {
    if (!AuthEventEmitter.instance) {
      AuthEventEmitter.instance = new AuthEventEmitter();
    }
    return AuthEventEmitter.instance;
  }

  subscribe(listener: AuthEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = AuthEventEmitter.getInstance();
