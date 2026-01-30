import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { api } from "@shared/routes";
import { z } from "zod";

// Mock data for fallback
const MOCK_MARKET_DATA = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 95000, price_change_percentage_24h: 2.5, market_cap: 1500000000000 },
  { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3500, price_change_percentage_24h: 1.2, market_cap: 400000000000 },
  { id: "solana", symbol: "sol", name: "Solana", current_price: 150, price_change_percentage_24h: -0.5, market_cap: 70000000000 },
  { id: "ripple", symbol: "xrp", name: "XRP", current_price: 0.6, price_change_percentage_24h: 0.1, market_cap: 30000000000 },
  { id: "cardano", symbol: "ada", name: "Cardano", current_price: 0.45, price_change_percentage_24h: -1.0, market_cap: 15000000000 },
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup Chat
  registerChatRoutes(app);

  // === Crypto API Proxies ===

  app.get(api.crypto.market.path, async (req, res) => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
      );
      if (!response.ok) throw new Error("CoinGecko API error");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("Using mock market data due to API error:", error);
      res.json(MOCK_MARKET_DATA);
    }
  });

  app.get(api.crypto.history.path, async (req, res) => {
    const id = req.params.id;
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`
      );
      if (!response.ok) throw new Error("CoinGecko API error");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn("Using mock history data due to API error:", error);
      // Generate mock history
      const prices = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const basePrice = id === 'bitcoin' ? 90000 : id === 'ethereum' ? 3000 : 100;
        const randomVar = (Math.random() - 0.5) * (basePrice * 0.1);
        return [date.getTime(), basePrice + randomVar];
      });
      res.json({ prices });
    }
  });

  // === Favorites Endpoints ===

  app.get(api.favorites.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const favorites = await storage.getFavorites(user.claims.sub);
    res.json(favorites);
  });

  app.post(api.favorites.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    try {
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(user.claims.sub, input);
      res.status(201).json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.favorites.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteFavorite(Number(req.params.id));
    res.status(204).send();
  });

  // === Scenarios Endpoints ===

  app.get(api.scenarios.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const scenarios = await storage.getScenarios(user.claims.sub);
    res.json(scenarios);
  });

  app.post(api.scenarios.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    try {
      // Coerce dates and decimals
      const body = {
        ...req.body,
        date: new Date(req.body.date),
        investmentAmount: String(req.body.investmentAmount), // Drizzle decimal is string in JS
      };

      const input = api.scenarios.create.input.parse(body);
      const scenario = await storage.createScenario(user.claims.sub, input);
      res.status(201).json(scenario);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.scenarios.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteScenario(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
