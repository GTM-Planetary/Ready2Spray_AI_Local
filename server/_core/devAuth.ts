import { Express, Request, Response } from "express";
import { sdk } from "./sdk";
import { upsertUser } from "../db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function registerDevAuthRoutes(app: Express) {
  const isDev = process.env.NODE_ENV === "development" || process.env.VITE_DEV_AUTH === "true";

  if (!isDev) {
    return;
  }

  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    try {
      const devUser = {
        openId: "dev-user-001",
        name: "Developer User",
        email: "dev@local.test",
        loginMethod: "dev",
        role: "admin",
        lastSignedIn: new Date(),
      };

      // Ensure the test user exists
      await upsertUser(devUser);

      // Create session token
      const sessionToken = await sdk.createSessionToken(devUser.openId, {
        name: devUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return res.json({ success: true, redirect: "/dashboard" });
    } catch (error) {
      console.error("[DevAuth] Login failed:", error);
      return res.status(500).json({ error: "Dev login failed" });
    }
  });

  console.log("[DevAuth] Development authentication routes registered");
}
