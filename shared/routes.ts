import { z } from 'zod';
import { insertFavoriteSchema, insertScenarioSchema, favorites, scenarios } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof favorites.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/favorites',
      input: insertFavoriteSchema,
      responses: {
        201: z.custom<typeof favorites.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/favorites/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  scenarios: {
    list: {
      method: 'GET' as const,
      path: '/api/scenarios',
      responses: {
        200: z.array(z.custom<typeof scenarios.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scenarios',
      input: insertScenarioSchema,
      responses: {
        201: z.custom<typeof scenarios.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/scenarios/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  crypto: {
    market: {
      method: 'GET' as const,
      path: '/api/crypto/market',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          symbol: z.string(),
          name: z.string(),
          current_price: z.number(),
          price_change_percentage_24h: z.number(),
          market_cap: z.number(),
        })),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/crypto/:id/history',
      responses: {
        200: z.object({
          prices: z.array(z.tuple([z.number(), z.number()])), // [timestamp, price]
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
