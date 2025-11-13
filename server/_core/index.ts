import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import cron from "node-cron";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Set up daily cron job for service plan processing at 6:00 AM
  // Cron format: second minute hour day month weekday
  // '0 6 * * *' = Every day at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('[Cron] Running daily service plan processing at 6:00 AM...');
    try {
      const { processServicePlans } = await import('../servicePlanScheduler');
      const result = await processServicePlans();
      console.log(`[Cron] Service plan processing complete: ${result.generated} jobs generated from ${result.processed} plans, ${result.errors} errors`);
    } catch (error) {
      console.error('[Cron] Service plan processing failed:', error);
    }
  });

  console.log('[Cron] Daily service plan processing scheduled for 6:00 AM');
  
  // Optional: Run immediately on server start for testing (comment out in production)
  // console.log('[Cron] Running initial service plan processing...');
  // const { processServicePlans } = await import('../servicePlanScheduler');
  // await processServicePlans();
}

startServer().catch(console.error);
