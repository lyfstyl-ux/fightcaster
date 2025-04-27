import { 
  users, 
  characters, 
  moves, 
  battles, 
  challenges,
  type User, 
  type InsertUser, 
  type Character, 
  type InsertCharacter,
  type Move,
  type InsertMove,
  type Battle,
  type InsertBattle,
  type Challenge,
  type InsertChallenge,
  type BattleState,
  type BattleAction,
  type BattleResult
} from "@shared/schema";

// Generic interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFid(fid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  
  // Move operations
  getMovesByCharacterId(characterId: number): Promise<Move[]>;
  
  // Battle operations
  createBattle(battle: InsertBattle): Promise<Battle>;
  getBattle(id: number): Promise<Battle | undefined>;
  getUserBattles(userId: number): Promise<Battle[]>;
  updateBattleState(battleId: number, action: BattleAction): Promise<BattleState>;
  getBattleState(battleId: number): Promise<BattleState | undefined>;
  endBattle(battleId: number, winnerId: number): Promise<Battle>;
  getRecentBattles(limit: number): Promise<Battle[]>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  getUserChallenges(userId: number): Promise<Challenge[]>;
  updateChallengeStatus(id: number, status: string): Promise<Challenge | undefined>;
  
  // Leaderboard
  getLeaderboard(limit: number): Promise<User[]>;
  
  // Recent players
  getRecentPlayers(userId: number, limit: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private moves: Map<number, Move>;
  private battles: Map<number, Battle>;
  private challenges: Map<number, Challenge>;
  private battleStates: Map<number, BattleState>;
  
  private userId: number = 1;
  private characterId: number = 1;
  private moveId: number = 1;
  private battleId: number = 1;
  private challengeId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.moves = new Map();
    this.battles = new Map();
    this.challenges = new Map();
    this.battleStates = new Map();
    
    // Initialize with some predefined characters
    this.initializeCharacters();
  }
  
  private initializeCharacters() {
    const fireSamurai: InsertCharacter = {
      name: "Fire Samurai",
      characterClass: "Warrior",
      rarity: "Rare",
      attack: 87,
      defense: 65,
      speed: 92,
      specialMove: "Inferno Slash",
      specialMoveDescription: "Deals massive damage with a 20% chance to apply a burn effect",
      imageUrl: "/characters/fire-samurai.svg",
    };
    
    const iceNinja: InsertCharacter = {
      name: "Ice Ninja",
      characterClass: "Assassin",
      rarity: "Common",
      attack: 72,
      defense: 88,
      speed: 79,
      specialMove: "Frost Strike",
      specialMoveDescription: "Moderate damage with a 30% chance to slow the opponent for 2 turns",
      imageUrl: "/characters/ice-ninja.svg",
    };
    
    const shadowAssassin: InsertCharacter = {
      name: "Shadow Assassin",
      characterClass: "Assassin",
      rarity: "Legendary",
      attack: 95,
      defense: 45,
      speed: 97,
      specialMove: "Void Embrace",
      specialMoveDescription: "High damage with a 25% chance to become untargetable for 1 turn",
      imageUrl: "/characters/shadow-assassin.svg",
    };
    
    const fireSamuraiChar = this.addCharacter(fireSamurai);
    const iceNinjaChar = this.addCharacter(iceNinja);
    const shadowAssassinChar = this.addCharacter(shadowAssassin);
    
    // Add moves for Fire Samurai
    this.addMove({
      characterId: fireSamuraiChar.id,
      name: "Basic Attack",
      damage: "15-25",
      description: "A basic sword attack",
      effect: null,
      cooldown: 0
    });
    
    this.addMove({
      characterId: fireSamuraiChar.id,
      name: "Inferno Slash",
      damage: "30-45",
      description: "A powerful fire attack with burn effect",
      effect: "burn",
      cooldown: 2
    });
    
    this.addMove({
      characterId: fireSamuraiChar.id,
      name: "Defensive Stance",
      damage: null,
      description: "Increase defense by 30% for the next turn",
      effect: "defense_boost",
      cooldown: 3
    });
    
    this.addMove({
      characterId: fireSamuraiChar.id,
      name: "Healing Flame",
      damage: null,
      description: "Restore 15-25 HP",
      effect: "heal",
      cooldown: 4
    });
    
    // Add moves for Ice Ninja
    this.addMove({
      characterId: iceNinjaChar.id,
      name: "Shuriken Throw",
      damage: "12-20",
      description: "Throw sharp shurikens at the enemy",
      effect: null,
      cooldown: 0
    });
    
    this.addMove({
      characterId: iceNinjaChar.id,
      name: "Frost Strike",
      damage: "25-35",
      description: "Attack with ice, chance to slow opponent",
      effect: "slow",
      cooldown: 2
    });
    
    // Add moves for Shadow Assassin
    this.addMove({
      characterId: shadowAssassinChar.id,
      name: "Shadow Strike",
      damage: "20-30",
      description: "Strike from the shadows",
      effect: null,
      cooldown: 0
    });
    
    this.addMove({
      characterId: shadowAssassinChar.id,
      name: "Void Embrace",
      damage: "40-60",
      description: "Powerful attack with chance to become untargetable",
      effect: "untargetable",
      cooldown: 3
    });
  }
  
  private addCharacter(character: InsertCharacter): Character {
    const id = this.characterId++;
    const newCharacter: Character = { ...character, id };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }
  
  private addMove(move: InsertMove): Move {
    const id = this.moveId++;
    const newMove: Move = { ...move, id };
    this.moves.set(id, newMove);
    return newMove;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByFid(fid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.fid === fid,
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      level: 1, 
      experience: 0, 
      rankPoints: 0 
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Character operations
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }
  
  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }
  
  // Move operations
  async getMovesByCharacterId(characterId: number): Promise<Move[]> {
    return Array.from(this.moves.values()).filter(
      (move) => move.characterId === characterId,
    );
  }
  
  // Battle operations
  async createBattle(battle: InsertBattle): Promise<Battle> {
    const id = this.battleId++;
    const newBattle: Battle = { 
      ...battle, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      winnerId: null,
      turns: 0,
      battleLog: [],
      player1Damage: 0,
      player2Damage: 0,
      player1CriticalHits: 0,
      player2CriticalHits: 0,
      player1Healing: 0,
      player2Healing: 0,
      player1StatusEffects: 0,
      player2StatusEffects: 0
    };
    this.battles.set(id, newBattle);
    
    // Initialize battle state
    const char1 = await this.getCharacter(battle.player1CharacterId);
    const char2 = await this.getCharacter(battle.player2CharacterId);
    
    if (char1 && char2) {
      const state: BattleState = {
        battleId: id,
        currentTurn: 1,
        currentPlayerId: battle.player1Id,
        player1Health: 100,
        player2Health: 100,
        player1Effects: [],
        player2Effects: [],
        battleLog: ["Battle started!"],
        status: 'active'
      };
      
      this.battleStates.set(id, state);
    }
    
    return newBattle;
  }
  
  async getBattle(id: number): Promise<Battle | undefined> {
    return this.battles.get(id);
  }
  
  async getUserBattles(userId: number): Promise<Battle[]> {
    return Array.from(this.battles.values()).filter(
      (battle) => battle.player1Id === userId || battle.player2Id === userId,
    );
  }
  
  async updateBattleState(battleId: number, action: BattleAction): Promise<BattleState> {
    const state = this.battleStates.get(battleId);
    if (!state) {
      throw new Error("Battle state not found");
    }
    
    const battle = this.battles.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }
    
    // Determine if player1 or player2 is acting
    const isPlayer1Acting = state.currentPlayerId === battle.player1Id;
    
    // Process action
    let damage = 0;
    let healing = 0;
    let criticalHit = false;
    let statusEffectApplied = false;
    
    if (action.type === "attack") {
      // Calculate damage
      if (action.damage) {
        const [min, max] = action.damage.split('-').map(Number);
        damage = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Critical hit (10% chance)
        if (Math.random() < 0.1) {
          damage = Math.floor(damage * 1.5);
          criticalHit = true;
        }
        
        // Apply damage to opponent
        if (isPlayer1Acting) {
          state.player2Health = Math.max(0, state.player2Health - damage);
          battle.player1Damage += damage;
          if (criticalHit) battle.player1CriticalHits++;
        } else {
          state.player1Health = Math.max(0, state.player1Health - damage);
          battle.player2Damage += damage;
          if (criticalHit) battle.player2CriticalHits++;
        }
      }
      
      // Apply effects
      if (action.effect) {
        statusEffectApplied = true;
        if (isPlayer1Acting) {
          state.player2Effects.push(action.effect);
          battle.player1StatusEffects++;
        } else {
          state.player1Effects.push(action.effect);
          battle.player2StatusEffects++;
        }
      }
    } else if (action.type === "heal") {
      // Calculate healing
      healing = Math.floor(Math.random() * 11) + 15; // 15-25 healing
      
      // Apply healing
      if (isPlayer1Acting) {
        state.player1Health = Math.min(100, state.player1Health + healing);
        battle.player1Healing += healing;
      } else {
        state.player2Health = Math.min(100, state.player2Health + healing);
        battle.player2Healing += healing;
      }
    }
    
    // Create battle log entry
    const player1 = await this.getUser(battle.player1Id);
    const player2 = await this.getUser(battle.player2Id);
    const char1 = await this.getCharacter(battle.player1CharacterId);
    const char2 = await this.getCharacter(battle.player2CharacterId);
    
    let logEntry = "";
    
    if (isPlayer1Acting) {
      if (action.type === "attack") {
        logEntry = `${char1?.name} used ${action.moveName} for ${damage} damage`;
        if (criticalHit) logEntry += " (CRITICAL HIT!)";
        if (statusEffectApplied) logEntry += ` and applied ${action.effect}`;
      } else if (action.type === "heal") {
        logEntry = `${char1?.name} healed for ${healing} HP`;
      }
    } else {
      if (action.type === "attack") {
        logEntry = `${char2?.name} used ${action.moveName} for ${damage} damage`;
        if (criticalHit) logEntry += " (CRITICAL HIT!)";
        if (statusEffectApplied) logEntry += ` and applied ${action.effect}`;
      } else if (action.type === "heal") {
        logEntry = `${char2?.name} healed for ${healing} HP`;
      }
    }
    
    state.battleLog.push(logEntry);
    battle.battleLog.push(logEntry);
    
    // Check if battle is over
    if (state.player1Health <= 0) {
      state.status = 'completed';
      state.winner = battle.player2Id;
      state.battleLog.push(`${player2?.username || 'Player 2'} wins!`);
      
      await this.endBattle(battleId, battle.player2Id);
    } else if (state.player2Health <= 0) {
      state.status = 'completed';
      state.winner = battle.player1Id;
      state.battleLog.push(`${player1?.username || 'Player 1'} wins!`);
      
      await this.endBattle(battleId, battle.player1Id);
    } else {
      // Next turn
      state.currentTurn++;
      state.currentPlayerId = isPlayer1Acting ? battle.player2Id : battle.player1Id;
    }
    
    // Update battle turns count
    battle.turns = state.currentTurn;
    battle.updatedAt = new Date();
    this.battles.set(battleId, battle);
    
    // Update battle state
    this.battleStates.set(battleId, state);
    
    return state;
  }
  
  async getBattleState(battleId: number): Promise<BattleState | undefined> {
    return this.battleStates.get(battleId);
  }
  
  async endBattle(battleId: number, winnerId: number): Promise<Battle> {
    const battle = this.battles.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }
    
    battle.status = "completed";
    battle.winnerId = winnerId;
    battle.updatedAt = new Date();
    
    this.battles.set(battleId, battle);
    
    // Award XP and rank points to users
    const winner = this.users.get(winnerId);
    const loserId = winnerId === battle.player1Id ? battle.player2Id : battle.player1Id;
    const loser = this.users.get(loserId);
    
    if (winner) {
      const winnerXp = 25;
      const winnerRankPoints = 15;
      
      winner.experience += winnerXp;
      winner.rankPoints += winnerRankPoints;
      
      // Level up if enough XP
      if (winner.experience >= winner.level * 100) {
        winner.level += 1;
        winner.experience = 0;
      }
      
      this.users.set(winnerId, winner);
    }
    
    if (loser) {
      const loserXp = 5;
      const loserRankPoints = -10;
      
      loser.experience += loserXp;
      loser.rankPoints = Math.max(0, loser.rankPoints + loserRankPoints);
      
      this.users.set(loserId, loser);
    }
    
    return battle;
  }
  
  async getRecentBattles(limit: number): Promise<Battle[]> {
    return Array.from(this.battles.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
  
  // Challenge operations
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const newChallenge: Challenge = { 
      ...challenge, 
      id, 
      createdAt: new Date(),
    };
    this.challenges.set(id, newChallenge);
    return newChallenge;
  }
  
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async getUserChallenges(userId: number): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.toUserId === userId && challenge.status === 'pending',
    );
  }
  
  async updateChallengeStatus(id: number, status: string): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge: Challenge = { ...challenge, status };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  // Leaderboard
  async getLeaderboard(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.rankPoints - a.rankPoints)
      .slice(0, limit);
  }
  
  // Recent players
  async getRecentPlayers(userId: number, limit: number): Promise<User[]> {
    // Get all battles involving the user
    const userBattles = await this.getUserBattles(userId);
    
    // Extract opponent IDs
    const opponentIds = new Set<number>();
    
    userBattles.forEach(battle => {
      if (battle.player1Id === userId) {
        opponentIds.add(battle.player2Id);
      } else if (battle.player2Id === userId) {
        opponentIds.add(battle.player1Id);
      }
    });
    
    // Get unique opponents
    const opponents = Array.from(opponentIds)
      .map(id => this.users.get(id))
      .filter((user): user is User => !!user);
    
    return opponents.slice(0, limit);
  }
}

export const storage = new MemStorage();
