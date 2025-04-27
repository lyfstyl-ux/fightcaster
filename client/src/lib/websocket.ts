// Battle updates service with WebSocket and HTTP polling fallback

import { apiRequest } from './queryClient';

type MessageCallback = (data: any) => void;
type ConnectionCallback = () => void;

// Types of connections to use for real-time updates
enum ConnectionType {
  WebSocket,
  HttpPolling
}

export class BattleService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, MessageCallback[]> = new Map();
  private connectHandlers: ConnectionCallback[] = [];
  private reconnectTimeout: number = 2000;
  private isConnecting: boolean = false;
  private maxReconnectTimeout: number = 30000;
  private connectionType: ConnectionType = ConnectionType.WebSocket;
  private pollingInterval: number | null = null;
  private battleId: number | null = null;
  private pollingIntervalMs: number = 2000; // How often to poll in ms
  
  constructor() {
    // Configure WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}`;
    
    console.log('Battle service initialized with WebSocket URL:', this.url);
    
    // Try WebSocket connection first
    this.connect();
    
    // Setup reconnection when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkConnection();
      }
    });
    
    // Periodic connection check
    setInterval(() => this.checkConnection(), 10000);
  }
  
  // Check and repair connection if needed
  private checkConnection(): void {
    // If we're using WebSockets and it's not connected, try to reconnect
    if (this.connectionType === ConnectionType.WebSocket && !this.isConnected() && !this.isConnecting) {
      console.log('Connection check - attempting WebSocket reconnection...');
      this.connect();
    }
  }
  
  public isConnected(): boolean {
    if (this.connectionType === ConnectionType.WebSocket) {
      return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    } else {
      return this.pollingInterval !== null;
    }
  }
  
  public connect(): void {
    if (this.isConnecting || this.isConnected()) {
      return;
    }
    
    if (this.connectionType === ConnectionType.WebSocket) {
      this.connectWebSocket();
    } else {
      this.startPolling();
    }
  }
  
  private connectWebSocket(): void {
    this.isConnecting = true;
    console.log('Connecting to WebSocket server:', this.url);
    
    try {
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log('WebSocket connection timeout, falling back to HTTP polling');
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          this.ws = null;
          this.isConnecting = false;
          this.switchToPolling();
        }
      }, 5000);
      
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection established successfully');
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectTimeout = 2000;
        
        // Verify connection with ping
        try {
          this.ws?.send(JSON.stringify({ type: 'PING' }));
        } catch (e) {
          console.warn('Failed to send initial ping:', e);
        }
        
        this.notifyConnectHandlers();
      };
      
      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`WebSocket connection closed: code=${event.code}, reason=${event.reason || 'No reason'}`);
        this.ws = null;
        this.isConnecting = false;
        
        // After several failed WebSocket attempts, switch to polling
        if (this.reconnectTimeout >= this.maxReconnectTimeout / 2) {
          console.log('Multiple WebSocket failures, switching to HTTP polling');
          this.switchToPolling();
        } else {
          this.scheduleReconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          // Handle ping/pong
          if (event.data === 'PING' || event.data === '"PING"') {
            this.ws?.send(JSON.stringify({ type: 'PONG' }));
            return;
          }
          
          const message = JSON.parse(event.data);
          
          if (message.type === 'PING') {
            this.ws?.send(JSON.stringify({ type: 'PONG' }));
            return;
          }
          
          this.handleMessage(message);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.switchToPolling();
    }
  }
  
  private switchToPolling(): void {
    console.log('Switching to HTTP polling fallback');
    this.connectionType = ConnectionType.HttpPolling;
    this.startPolling();
  }
  
  // Start HTTP polling mechanism for battle updates
  private startPolling(): void {
    if (this.pollingInterval) {
      return; // Already polling
    }
    
    console.log('Starting HTTP polling for battle updates');
    
    // If we have a battleId, start polling that specific battle
    if (this.battleId) {
      this.pollingInterval = window.setInterval(() => {
        this.pollBattleUpdate(this.battleId!);
      }, this.pollingIntervalMs);
      
      // Immediately poll once
      this.pollBattleUpdate(this.battleId);
      
      this.notifyConnectHandlers();
    } else {
      console.warn('Cannot start polling without a battleId');
    }
  }
  
  // Poll for battle updates using HTTP
  private async pollBattleUpdate(battleId: number): Promise<void> {
    try {
      const response = await apiRequest(`/api/battles/${battleId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response) {
        // Process the polling response like a WebSocket message
        this.handleMessage({
          type: 'BATTLE_UPDATE',
          battleId,
          data: response
        });
      }
    } catch (error) {
      console.error('Error polling battle update:', error);
    }
  }
  
  // Set current battle ID for polling
  public setBattleId(battleId: number | null): void {
    this.battleId = battleId;
    
    // If using polling and battleId changes, restart polling
    if (this.connectionType === ConnectionType.HttpPolling && this.battleId) {
      this.stopPolling();
      this.startPolling();
    }
  }
  
  // Stop HTTP polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  // Send a message (via WebSocket if connected, otherwise no-op)
  public send(message: any): boolean {
    if (this.connectionType === ConnectionType.WebSocket && this.isConnected()) {
      try {
        this.ws!.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    
    console.warn('Cannot send message - WebSocket not connected');
    return false;
  }
  
  // Register for battle events
  public subscribe(type: string, callback: MessageCallback): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(callback);
  }
  
  // Unregister from battle events
  public unsubscribe(type: string, callback: MessageCallback): void {
    if (!this.messageHandlers.has(type)) {
      return;
    }
    
    const handlers = this.messageHandlers.get(type)!;
    const index = handlers.indexOf(callback);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
  
  // Register for connection events
  public onConnect(callback: ConnectionCallback): void {
    this.connectHandlers.push(callback);
    
    // Call immediately if already connected
    if (this.isConnected()) {
      callback();
    }
  }
  
  // Process an incoming message
  private handleMessage(message: any): void {
    if (!message || !message.type) {
      console.warn('Received invalid message:', message);
      return;
    }
    
    const { type } = message;
    
    if (!this.messageHandlers.has(type)) {
      return;
    }
    
    const handlers = this.messageHandlers.get(type)!;
    
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for type ${type}:`, error);
      }
    }
  }
  
  // Notify all connection handlers
  private notifyConnectHandlers(): void {
    for (const handler of this.connectHandlers) {
      try {
        handler();
      } catch (error) {
        console.error('Error in connect handler:', error);
      }
    }
  }
  
  // Schedule a WebSocket reconnection attempt
  private scheduleReconnect(): void {
    console.log(`Scheduling reconnect in ${this.reconnectTimeout}ms`);
    
    setTimeout(() => {
      if (!this.isConnected() && !this.isConnecting) {
        this.connect();
      }
    }, this.reconnectTimeout);
    
    // Exponential backoff with max limit
    this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, this.maxReconnectTimeout);
  }
  
  // Close all connections
  public close(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    
    this.stopPolling();
  }
}

// Create a singleton instance
export const battleService = new BattleService();

// For backward compatibility, keep the old name
export const battleWebSocket = battleService;

export default battleService;