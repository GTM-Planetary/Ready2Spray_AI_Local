import { Express, Request, Response } from "express";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function registerDevAuthRoutes(app: Express) {
  const isDev = process.env.NODE_ENV === "development" || process.env.VITE_DEV_AUTH === "true";

  if (!isDev) {
    return;
  }

  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    try {
      // Use the owner credentials from environment variables
      // This avoids database operations and Supabase RLS issues
      const ownerOpenId = process.env.OWNER_OPEN_ID || "local-admin-001";
      const ownerName = process.env.OWNER_NAME || "Local Admin";

      console.log("[DevAuth] Logging in as owner:", ownerName, ownerOpenId);

      // Create session token using the owner's openId
      const sessionToken = await sdk.createSessionToken(ownerOpenId, {
        name: ownerName,
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
