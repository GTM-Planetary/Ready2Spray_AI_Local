import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Organizations table with subscription management
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  ownerId: int("owner_id").notNull().references(() => users.id),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionId: varchar("subscription_id", { length: 255 }),
  subscriptionPlan: mysqlEnum("subscription_plan", ["FREE", "BASIC", "PRO", "ENTERPRISE"]).default("FREE").notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Customers table
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Personnel table
export const personnel = mysqlTable("personnel", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: mysqlEnum("role", ["applicator", "technician", "driver", "pilot"]).notNull(),
  status: mysqlEnum("status", ["active", "on_leave", "inactive"]).default("active").notNull(),
  certifications: text("certifications"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = typeof personnel.$inferInsert;

// Jobs table
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  customerId: int("customer_id").references(() => customers.id),
  assignedPersonnelId: int("assigned_personnel_id").references(() => personnel.id),
  title: text("title").notNull(),
  description: text("description"),
  jobType: mysqlEnum("job_type", ["crop_dusting", "pest_control", "fertilization", "herbicide"]).notNull(),
  status: mysqlEnum("status", ["pending", "ready", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  locationAddress: text("location_address"),
  locationLat: varchar("location_lat", { length: 50 }),
  locationLng: varchar("location_lng", { length: 50 }),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  notes: text("notes"),
  // Agricultural details
  state: varchar("state", { length: 100 }),
  commodityCrop: varchar("commodity_crop", { length: 200 }),
  targetPest: varchar("target_pest", { length: 200 }),
  epaNumber: varchar("epa_number", { length: 100 }),
  applicationRate: varchar("application_rate", { length: 100 }),
  applicationMethod: varchar("application_method", { length: 100 }),
  chemicalProduct: varchar("chemical_product", { length: 200 }),
  // Crop specifics
  reEntryInterval: varchar("re_entry_interval", { length: 100 }),
  preharvestInterval: varchar("preharvest_interval", { length: 100 }),
  maxApplicationsPerSeason: varchar("max_applications_per_season", { length: 50 }),
  maxRatePerSeason: varchar("max_rate_per_season", { length: 100 }),
  methodsAllowed: varchar("methods_allowed", { length: 200 }),
  rate: varchar("rate", { length: 100 }),
  diluentAerial: varchar("diluent_aerial", { length: 100 }),
  diluentGround: varchar("diluent_ground", { length: 100 }),
  diluentChemigation: varchar("diluent_chemigation", { length: 100 }),
  genericConditions: text("generic_conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Products table (EPA-registered agricultural products)
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  epaNumber: varchar("epa_number", { length: 100 }),
  manufacturer: text("manufacturer"),
  activeIngredients: text("active_ingredients"),
  productType: varchar("product_type", { length: 100 }),
  applicationRate: text("application_rate"),
  safetyNotes: text("safety_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// AI Conversations table
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  userId: int("user_id").notNull().references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

// AI Messages table
export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull().references(() => aiConversations.id),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;

// AI Usage tracking table
export const aiUsage = mysqlTable("ai_usage", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  userId: int("user_id").notNull().references(() => users.id),
  conversationId: int("conversation_id").references(() => aiConversations.id),
  model: varchar("model", { length: 100 }).notNull(),
  inputTokens: int("input_tokens").notNull(),
  outputTokens: int("output_tokens").notNull(),
  totalTokens: int("total_tokens").notNull(),
  cost: varchar("cost", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;

// Maps table for KML/GPX/GeoJSON file uploads
export const maps = mysqlTable("maps", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  fileType: mysqlEnum("file_type", ["kml", "gpx", "geojson"]).notNull(),
  publicUrl: text("public_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Map = typeof maps.$inferSelect;
export type InsertMap = typeof maps.$inferInsert;
