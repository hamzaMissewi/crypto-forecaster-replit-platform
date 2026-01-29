import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertFavoriteSchema, insertScenarioSchema } from "@shared/schema";
import type { InsertFavorite, InsertScenario } from "@shared/schema";

// --- MARKET DATA ---

export function useCryptoMarket() {
  return useQuery({
    queryKey: [api.crypto.market.path],
    queryFn: async () => {
      const res = await fetch(api.crypto.market.path);
      if (!res.ok) throw new Error("Failed to fetch market data");
      return api.crypto.market.responses[200].parse(await res.json());
    },
    staleTime: 60 * 1000, // 1 minute cache
  });
}

export function useCryptoHistory(id: string) {
  return useQuery({
    queryKey: [api.crypto.history.path, id],
    queryFn: async () => {
      const url = buildUrl(api.crypto.history.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch history data");
      return api.crypto.history.responses[200].parse(await res.json());
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minute cache
  });
}

// --- FAVORITES ---

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFavorite) => {
      const validated = insertFavoriteSchema.parse(data);
      const res = await fetch(api.favorites.create.path, {
        method: api.favorites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add favorite");
      return api.favorites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.favorites.delete.path, { id });
      const res = await fetch(url, {
        method: api.favorites.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] }),
  });
}

// --- SCENARIOS (Time Machine) ---

export function useScenarios() {
  return useQuery({
    queryKey: [api.scenarios.list.path],
    queryFn: async () => {
      const res = await fetch(api.scenarios.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch scenarios");
      return api.scenarios.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScenario) => {
      // Need to ensure decimals/dates are handled correctly for JSON
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(), // Ensure ISO string for API
      };
      // Note: We might need to handle decimal serialization if Zod expects number but receives string
      
      const res = await fetch(api.scenarios.create.path, {
        method: api.scenarios.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create scenario");
      return api.scenarios.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.scenarios.list.path] }),
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.scenarios.delete.path, { id });
      const res = await fetch(url, {
        method: api.scenarios.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete scenario");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.scenarios.list.path] }),
  });
}
