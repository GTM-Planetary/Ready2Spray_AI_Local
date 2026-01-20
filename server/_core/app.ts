import express from "express";
import { createServer } from "http";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server_core/context";
import { t } from "@/server_core/trpc";
import { corsMiddleware } from "@/server_core/cors";
import { logApiRequest } from "@/server_core/webhookApi";
import { setupVite } from "@/server_core/vite";
import rateLimit from 'express-rate-limit';

// General rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints - 5 requests per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function createApp() {
  const app = express();
  const server = createServer(app);

  // Apply rate limiting middleware
  app.use(generalLimiter);
  app.use('/api/trpc/auth', authLimiter);

  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Detailed health check with database connectivity
  app.get('/health/ready', async (req, res) => {
    try {
      // Test database connection by running a simple query
      const { db } = await import('../db');
      await db.execute('SELECT 1');

      res.json({
        status: 'ok',
        timestamp: Date.now(),
        uptime: process.uptime(),
        database: 'connected',
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: Date.now(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Setup Vite in development
  await setupVite(app, server);

  // Setup CORS
  app.use(corsMiddleware);

  // Setup API request logging
  app.use(logApiRequest);

  // Setup tRPC
  const trpc = t.createCallerFactory(appRouter);
  const createContext = createTRPCContext;
  app.use(
    "/api/trpc",
    trpc({
      createContext,
    })
  );

  return { app, server };
}
