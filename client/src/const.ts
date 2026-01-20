export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/ready2spray-logo.png";

// Check if OAuth is configured
export const isOAuthConfigured = () => Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL);

// Generate login URL at runtime so redirect URI reflects the current origin.
// Returns "/" if OAuth is not configured.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  if (!oauthPortalUrl) {
    return "/"; // Fallback to landing page if OAuth not configured
  }

  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
