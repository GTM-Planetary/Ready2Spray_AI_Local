export const ENV = {
  appId: process.env.VITE_APP_ID ?? "ready2spray-local",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  isDevAuth: process.env.VITE_DEV_AUTH === "true",
  invitationCode: process.env.INVITATION_CODE ?? "BETA2024",
};
