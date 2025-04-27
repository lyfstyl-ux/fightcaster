import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertBattleSchema,
  insertChallengeSchema,
  type BattleAction
} from "@shared/schema";

// Extend the Express session type with our custom properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup a simpler WebSocket server for battle updates
  const wss = new WebSocketServer({ server: httpServer });
  
  // Keep track of all connected clients
  const clients = new Set();
  
  wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to CastFight game server',
      timestamp: new Date().toISOString()
    }));
    
    // Handle messages
    ws.on('message', function incoming(message) {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle ping messages
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle connection close
    ws.on('close', function close() {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
      clients.delete(ws);
    });
  });
  
  // Handle server errors
  wss.on('error', function error(err) {
    console.error('WebSocket server error:', err);
  });
  
  // Helper function to broadcast battle updates to WebSocket clients
  const broadcastBattleUpdate = (battleId: number, data: any) => {
    try {
      // Create a message with additional metadata
      const message = JSON.stringify({
        type: 'BATTLE_UPDATE',
        battleId,
        data,
        timestamp: new Date().toISOString(),
        messageId: Math.random().toString(36).substring(2, 15)
      });
      
      let clientCount = 0;
      
      // Log message size for debugging
      console.log(`Broadcasting battle update: battleId=${battleId}, message size=${message.length} bytes`);
      
      // Only broadcast to open connections
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(message);
            clientCount++;
          } catch (e) {
            console.error('Failed to send update to client:', e);
          }
        }
      });
      
      console.log(`Battle update for battle ${battleId} sent to ${clientCount} clients`);
    } catch (error) {
      console.error('Error preparing battle update broadcast:', error);
    }
  };
  
  // Auth routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { fid } = req.body;
      
      if (!fid) {
        return res.status(400).json({ message: 'Farcaster ID is required' });
      }
      
      let user = await storage.getUserByFid(fid);
      
      if (!user) {
        // Auto-register new users based on FID
        const newUser = {
          username: `user${fid}`,
          password: "password", // Not used with Farcaster auth
          fid,
          ens: null,
          avatarUrl: null
        };
        
        user = await storage.createUser(newUser);
      }
      
      req.session.userId = user.id;
      
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Character routes
  app.get('/api/characters', async (_req: Request, res: Response) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json({ characters });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/characters/:id', async (req: Request, res: Response) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: 'Character not found' });
      }
      
      const moves = await storage.getMovesByCharacterId(characterId);
      
      res.json({ character, moves });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Battle routes
  app.post('/api/battles', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const validatedData = insertBattleSchema.parse(req.body);
      
      // Ensure the user is player1
      if (validatedData.player1Id !== userId) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      
      const battle = await storage.createBattle(validatedData);
      const battleState = await storage.getBattleState(battle.id);
      
      // Broadcast new battle
      broadcastBattleUpdate(battle.id, { battle, battleState });
      
      res.json({ battle, battleState });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/battles/:id', async (req: Request, res: Response) => {
    try {
      const battleId = parseInt(req.params.id);
      const battle = await storage.getBattle(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: 'Battle not found' });
      }
      
      const battleState = await storage.getBattleState(battleId);
      
      res.json({ battle, battleState });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/battles/:id/action', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const battleId = parseInt(req.params.id);
      const battle = await storage.getBattle(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: 'Battle not found' });
      }
      
      const battleState = await storage.getBattleState(battleId);
      
      if (!battleState) {
        return res.status(404).json({ message: 'Battle state not found' });
      }
      
      // Check if it's the user's turn
      if (battleState.currentPlayerId !== userId) {
        return res.status(403).json({ message: 'Not your turn' });
      }
      
      const action = req.body as BattleAction;
      
      const updatedState = await storage.updateBattleState(battleId, action);
      
      // Broadcast battle update
      broadcastBattleUpdate(battleId, { battleState: updatedState });
      
      res.json({ battleState: updatedState });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/battles/user/recent', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const battles = await storage.getUserBattles(userId);
      
      // Sort by most recent, handle possible null dates
      battles.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date();
        const dateB = b.updatedAt || b.createdAt || new Date();
        return dateB.getTime() - dateA.getTime();
      });
      
      // Limit to 5
      const recentBattles = battles.slice(0, 5);
      
      // Get opponent details
      const enhancedBattles = await Promise.all(recentBattles.map(async (battle) => {
        const opponentId = battle.player1Id === userId ? battle.player2Id : battle.player1Id;
        const opponent = await storage.getUser(opponentId);
        
        return {
          ...battle,
          opponent: opponent ? {
            id: opponent.id,
            username: opponent.username,
            ens: opponent.ens,
            avatarUrl: opponent.avatarUrl
          } : null,
          won: battle.winnerId === userId
        };
      }));
      
      res.json({ battles: enhancedBattles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Challenge routes
  app.post('/api/challenges', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const validatedData = insertChallengeSchema.parse(req.body);
      
      // Ensure the user is fromUserId
      if (validatedData.fromUserId !== userId) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      
      const challenge = await storage.createChallenge({
        ...validatedData,
        status: 'pending'
      });
      
      res.json({ challenge });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/challenges', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const challenges = await storage.getUserChallenges(userId);
      
      // Get challenger details
      const enhancedChallenges = await Promise.all(challenges.map(async (challenge) => {
        const challenger = await storage.getUser(challenge.fromUserId);
        const character = await storage.getCharacter(challenge.fromCharacterId);
        
        return {
          ...challenge,
          challenger: challenger ? {
            id: challenger.id,
            username: challenger.username,
            ens: challenger.ens,
            avatarUrl: challenger.avatarUrl
          } : null,
          character: character || null
        };
      }));
      
      res.json({ challenges: enhancedChallenges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/challenges/:id/accept', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Ensure the user is the challenge recipient
      if (challenge.toUserId !== userId) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      
      // Update challenge status
      const updatedChallenge = await storage.updateChallengeStatus(challengeId, 'accepted');
      
      // Create a battle from this challenge
      const { characterId } = req.body;
      
      if (!characterId) {
        return res.status(400).json({ message: 'Character ID is required' });
      }
      
      const battle = await storage.createBattle({
        player1Id: challenge.fromUserId,
        player2Id: userId,
        player1CharacterId: challenge.fromCharacterId,
        player2CharacterId: characterId,
        status: 'active'
      });
      
      const battleState = await storage.getBattleState(battle.id);
      
      res.json({ challenge: updatedChallenge, battle, battleState });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/challenges/:id/reject', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Ensure the user is the challenge recipient
      if (challenge.toUserId !== userId) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      
      // Update challenge status
      const updatedChallenge = await storage.updateChallengeStatus(challengeId, 'rejected');
      
      res.json({ challenge: updatedChallenge });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // User search route
  app.get('/api/users/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.query as { query: string };
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      // For simplicity in the in-memory storage, search all users
      const allUsers = Array.from((storage as any).users.values());
      
      const matchedUsers = allUsers.filter((user: any) => 
        user.id !== userId && (
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.fid.includes(query) ||
          (user.ens && user.ens.toLowerCase().includes(query.toLowerCase()))
        )
      );
      
      res.json({ users: matchedUsers.slice(0, 10) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Leaderboard route
  app.get('/api/leaderboard', async (_req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      
      res.json({ leaderboard });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Recent players route
  app.get('/api/players/recent', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const recentPlayers = await storage.getRecentPlayers(userId, 5);
      
      res.json({ players: recentPlayers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return httpServer;
}
