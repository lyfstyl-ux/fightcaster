import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fid: text("fid").notNull().unique(), // Farcaster ID
  ens: text("ens"), // Ethereum Name Service
  avatarUrl: text("avatar_url"),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  rankPoints: integer("rank_points").default(0).notNull(),
});

// Characters table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  characterClass: text("character_class").notNull(),
  rarity: text("rarity").notNull(), // common, rare, legendary
  attack: integer("attack").notNull(),
  defense: integer("defense").notNull(),
  speed: integer("speed").notNull(),
  specialMove: text("special_move").notNull(),
  specialMoveDescription: text("special_move_description").notNull(),
  imageUrl: text("image_url").notNull(),
});

// Character moves
export const moves = pgTable("moves", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  damage: text("damage"), // Format: "15-25"
  effect: text("effect"),
  description: text("description").notNull(),
  cooldown: integer("cooldown").default(0),
});

// Battles
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull(),
  player2Id: integer("player2_id").notNull(),
  player1CharacterId: integer("player1_character_id").notNull(),
  player2CharacterId: integer("player2_character_id").notNull(),
  winnerId: integer("winner_id"),
  status: text("status").notNull(), // pending, active, completed
  turns: integer("turns").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  battleLog: json("battle_log").default([]),
  player1Damage: integer("player1_damage").default(0),
  player2Damage: integer("player2_damage").default(0),
  player1CriticalHits: integer("player1_critical_hits").default(0),
  player2CriticalHits: integer("player2_critical_hits").default(0),
  player1Healing: integer("player1_healing").default(0),
  player2Healing: integer("player2_healing").default(0),
  player1StatusEffects: integer("player1_status_effects").default(0),
  player2StatusEffects: integer("player2_status_effects").default(0),
});

// Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  fromCharacterId: integer("from_character_id").notNull(),
  status: text("status").notNull(), // pending, accepted, rejected, expired
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fid: true,
  ens: true,
  avatarUrl: true,
});

export const insertCharacterSchema = createInsertSchema(characters);

export const insertMoveSchema = createInsertSchema(moves);

export const insertBattleSchema = createInsertSchema(battles).pick({
  player1Id: true,
  player2Id: true,
  player1CharacterId: true,
  player2CharacterId: true,
  status: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  fromUserId: true,
  toUserId: true,
  fromCharacterId: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Move = typeof moves.$inferSelect;
export type InsertMove = z.infer<typeof insertMoveSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

// Additional types for the frontend
export type BattleAction = {
  type: string;
  moveId?: number;
  moveName: string;
  damage?: number;
  effect?: string;
  targetId: number;
};

export type BattleState = {
  battleId: number;
  currentTurn: number;
  currentPlayerId: number;
  player1Health: number;
  player2Health: number;
  player1Effects: string[];
  player2Effects: string[];
  battleLog: string[];
  status: 'active' | 'completed';
  winner?: number;
};

export type BattleResult = {
  battleId: number;
  won: boolean;
  opponentId: number;
  opponentName: string;
  xpGained: number;
  rankPointsChange: number;
  characterExperience: number;
  characterLevel: number;
  levelProgress: number;
  totalTurns: number;
  damageDealt: number;
  damageTaken: number;
  criticalHits: number;
  healing: number;
  statusEffects: number;
};
