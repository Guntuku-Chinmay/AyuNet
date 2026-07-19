import { AsyncLocalStorage } from 'async_hooks';

export interface RequestStore {
  requestId: string;
}

export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<RequestStore>();

  /**
   * Run a callback within the context of a request store.
   */
  static run<T>(store: RequestStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  /**
   * Get the current request store.
   */
  static get current(): RequestStore | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current request ID if it exists.
   */
  static get requestId(): string | undefined {
    return this.current?.requestId;
  }
}
