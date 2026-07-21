import { storage } from '../utils/storage';

export type SocketEventHandler = (data: any) => void;

class SocketClient {
  private socket: any = null;
  private listeners: Map<string, Set<SocketEventHandler>> = new Map();

  public connect() {
    if (typeof window === 'undefined') return;
    const token = storage.getItem<string | null>('ayunet_access_token', null);
    if (!token) return;

    // Socket.IO client baseline interface
    console.log('[SocketClient] Connecting to real-time events gateway...');
  }

  public subscribe(event: string, handler: SocketEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public disconnect() {
    this.listeners.clear();
    console.log('[SocketClient] Disconnected from events gateway.');
  }
}

export const socketClient = new SocketClient();
