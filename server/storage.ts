import { users, favorites, scenarios, type User, type InsertUser, type Favorite, type InsertFavorite, type Scenario, type InsertScenario } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(userId: string, favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;

  // Scenarios
  getScenarios(userId: string): Promise<Scenario[]>;
  createScenario(userId: string, scenario: InsertScenario): Promise<Scenario>;
  deleteScenario(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(userId: string, favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values({ ...favorite, userId }).returning();
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  async getScenarios(userId: string): Promise<Scenario[]> {
    return await db.select().from(scenarios).where(eq(scenarios.userId, userId));
  }

  async createScenario(userId: string, scenario: InsertScenario): Promise<Scenario> {
    const [newScenario] = await db.insert(scenarios).values({ ...scenario, userId }).returning();
    return newScenario;
  }

  async deleteScenario(id: number): Promise<void> {
    await db.delete(scenarios).where(eq(scenarios.id, id));
  }
}

export const storage = new DatabaseStorage();
