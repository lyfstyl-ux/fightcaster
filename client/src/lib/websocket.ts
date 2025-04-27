// Battle updates service using HTTP polling for compatibility with Vite in Replit
// WebSocket approach was causing conflicts with Vite's own WebSocket

import { apiRequest } from './queryClient';

type MessageCallback = (data: any) => void;
type ConnectionCallback = () => void;

export class BattleService {
  private messageHandlers: Map<string, MessageCallback[]> = new Map();
  private connectHandlers: ConnectionCallback[] = [];
  private pollingInterval: number | null = null;
  private battleId: number | null = null;
  private pollingIntervalMs: number = 2000; // How often to poll in ms
  private isConnecting: boolean = false;
  
  constructor() {
    console.log('Battle service initialized using HTTP polling');
    
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
    if (!this.isConnected() && !this.isConnecting && this.battleId) {
      console.log('Connection check - starting polling...');
      this.connect();
    }
  }
  
  public isConnected(): boolean {
    return this.pollingInterval !== null;
  }
  
  public connect(): void {
    if (this.isConnecting || this.isConnected()) {
      return;
    }
    
    this.startPolling();
  }
  
  // Start HTTP polling mechanism for battle updates
  private startPolling(): void {
    if (this.pollingInterval) {
      return; // Already polling
    }
    
    console.log('Starting HTTP polling for battle updates');
    this.isConnecting = true;
    
    // If we have a battleId, start polling that specific battle
    if (this.battleId) {
      this.pollingInterval = window.setInterval(() => {
        this.pollBattleUpdate(this.battleId!);
      }, this.pollingIntervalMs);
      
      // Immediately poll once
      this.pollBattleUpdate(this.battleId);
      
      this.isConnecting = false;
      this.notifyConnectHandlers();
    } else {
      console.warn('Cannot start polling without a battleId');
      this.isConnecting = false;
    }
  }
  
  // Poll for battle updates using HTTP
  private async pollBattleUpdate(battleId: number): Promise<void> {
    try {
      // Use the new dedicated updates endpoint
      const response = await apiRequest('GET', `/api/battles/${battleId}/updates`);
      const data = await response.json();
      
      if (data) {
        // Process the polling response like a WebSocket message
        this.handleMessage({
          type: 'BATTLE_UPDATE',
          battleId,
          data: data
        });
      }
    } catch (error) {
      console.error('Error polling battle update:', error);
    }
  }
  
  // Set current battle ID for polling
  public setBattleId(battleId: number | null): void {
    this.battleId = battleId;
    
    // If battleId changes, restart polling
    if (this.battleId) {
      this.stopPolling();
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }
  
  // Stop HTTP polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  // Send a message - this is a no-op in HTTP polling mode
  // Kept for backward compatibility
  public send(message: any): boolean {
    console.warn('WebSocket send is not supported in HTTP polling mode');
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
  
  // Close all connections
  public close(): void {
    this.stopPolling();
  }
}

// Create a singleton instance
export const battleService = new BattleService();

// For backward compatibility, keep the old name
export const battleWebSocket = battleService;

export default battleService;