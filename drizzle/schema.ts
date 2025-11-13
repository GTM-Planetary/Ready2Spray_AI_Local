import { boolean, integer, json, numeric, pgEnum, pgTable, text, timestamp, varchar, date, time } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Define enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["FREE", "BASIC", "PRO", "ENTERPRISE"]);
export const personnelRoleEnum = pgEnum("personnel_role", ["applicator", "technician", "driver", "pilot", "ground_crew", "manager", "dispatcher"]);
export const statusEnum = pgEnum("status", ["active", "on_leave", "inactive"]);
export const jobTypeEnum = pgEnum("job_type", ["crop_dusting", "pest_control", "fertilization", "herbicide"]);
export const jobStatusEnum = pgEnum("job_status", ["pending", "ready", "in_progress", "completed", "cancelled"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const fileTypeEnum = pgEnum("file_type", ["kml", "gpx", "geojson"]);

// New enums for expanded platform
export const orgModeEnum = pgEnum("org_mode", ["ag_aerial", "residential_pest", "both"]);
export const siteTypeEnum = pgEnum("site_type", ["field", "orchard", "vineyard", "pivot", "property", "commercial_building"]);
export const propertyTypeEnum = pgEnum("property_type", ["residential", "commercial", "multi_family", "industrial"]);
export const zoneTypeEnum = pgEnum("zone_type", ["interior", "exterior", "yard", "garage", "attic", "basement", "crawl_space", "perimeter", "custom"]);
export const equipmentTypeEnum = pgEnum("equipment_type", ["plane", "helicopter", "ground_rig", "truck", "backpack", "hand_sprayer", "ulv", "other"]);
export const equipmentStatusEnum = pgEnum("equipment_status", ["active", "maintenance", "inactive"]);
export const productTypeEnum = pgEnum("product_type", ["herbicide", "insecticide", "fungicide", "rodenticide", "adjuvant", "other"]);
export const signalWordEnum = pgEnum("signal_word", ["caution", "warning", "danger"]);
export const applicationMethodEnum = pgEnum("application_method", ["aerial", "ground_boom", "backpack", "hand_wand", "ulv", "chemigation", "other"]);
export const servicePlanTypeEnum = pgEnum("service_plan_type", ["monthly", "quarterly", "bi_monthly", "annual", "one_off"]);
export const servicePlanStatusEnum = pgEnum("service_plan_status", ["active", "paused", "cancelled", "completed"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Organizations table with subscription management and mode selection
export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionId: varchar("subscription_id", { length: 255 }),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("FREE").notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("active"),
  // New fields for mode selection
  mode: orgModeEnum("mode").default("ag_aerial").notNull(),
  featuresEnabled: json("features_enabled"), // ['service_plans', 'zones', 'load_sheets', 'flight_board']
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Customers table
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Sites table (fields for ag, properties for pest control)
export const sites = pgTable("sites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  customerId: integer("customer_id").references(() => customers.id),
  name: varchar("name", { length: 255 }).notNull(),
  siteType: siteTypeEnum("site_type").notNull(),
  // Location
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  polygon: json("polygon"), // GeoJSON polygon for boundaries
  centerLat: numeric("center_lat", { precision: 10, scale: 8 }),
  centerLng: numeric("center_lng", { precision: 11, scale: 8 }),
  acres: numeric("acres", { precision: 10, scale: 2 }),
  // Ag-specific fields
  crop: varchar("crop", { length: 100 }),
  variety: varchar("variety", { length: 100 }),
  growthStage: varchar("growth_stage", { length: 50 }),
  // Sensitive areas nearby
  sensitiveAreas: json("sensitive_areas"), // [{type: 'bee_yard', distance: 500, notes: '...'}]
  // Pest control-specific fields
  propertyType: propertyTypeEnum("property_type"),
  units: integer("units").default(1),
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;

// Zones table (for pest control treatment areas)
export const zones = pgTable("zones", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  siteId: integer("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  zoneType: zoneTypeEnum("zone_type").notNull(),
  description: text("description"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

// Equipment table (planes, trucks, rigs, backpacks)
export const equipment = pgTable("equipment", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  equipmentType: equipmentTypeEnum("equipment_type").notNull(),
  // Identification
  tailNumber: varchar("tail_number", { length: 50 }),
  licensePlate: varchar("license_plate", { length: 50 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  // Specifications
  tankCapacity: numeric("tank_capacity", { precision: 10, scale: 2 }),
  swathWidth: numeric("swath_width", { precision: 10, scale: 2 }),
  maxSpeed: numeric("max_speed", { precision: 10, scale: 2 }),
  // Status
  status: equipmentStatusEnum("status").default("active"),
  // Maintenance
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  maintenanceNotes: text("maintenance_notes"),
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

// Personnel table
export const personnel = pgTable("personnel", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: personnelRoleEnum("role").notNull(),
  status: statusEnum("status").default("active").notNull(),
  certifications: text("certifications"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = typeof personnel.$inferInsert;

// Job Statuses table - customizable per organization
export const jobStatuses = pgTable("job_statuses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // Hex color code
  displayOrder: integer("display_order").notNull(), // For sorting
  category: varchar("category", { length: 20 }).notNull(), // 'pending', 'active', 'completed' for dashboard grouping
  isDefault: boolean("is_default").default(false).notNull(), // Default status for new jobs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JobStatus = typeof jobStatuses.$inferSelect;
export type InsertJobStatus = typeof jobStatuses.$inferInsert;

// Job Status History table (audit trail for status changes)
export const jobStatusHistory = pgTable("job_status_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  fromStatusId: integer("from_status_id").references(() => jobStatuses.id),
  toStatusId: integer("to_status_id").notNull().references(() => jobStatuses.id),
  changedByUserId: integer("changed_by_user_id").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JobStatusHistory = typeof jobStatusHistory.$inferSelect;
export type InsertJobStatusHistory = typeof jobStatusHistory.$inferInsert;

// Products table (EPA-registered chemical catalog)
export const productsNew = pgTable("products_new", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  epaRegNumber: varchar("epa_reg_number", { length: 50 }).notNull(),
  // Basic info
  brandName: varchar("brand_name", { length: 255 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  // Active ingredients
  activeIngredients: json("active_ingredients"), // [{name: 'Glyphosate', percentage: 41.0}]
  // Classification
  productType: productTypeEnum("product_type").notNull(),
  signalWord: signalWordEnum("signal_word").notNull(),
  isRup: boolean("is_rup").default(false), // Restricted Use Pesticide
  // Use site flags
  indoorAllowed: boolean("indoor_allowed").default(false),
  outdoorAllowed: boolean("outdoor_allowed").default(true),
  aerialAllowed: boolean("aerial_allowed").default(false),
  groundBoomAllowed: boolean("ground_boom_allowed").default(true),
  backpackAllowed: boolean("backpack_allowed").default(false),
  handWandAllowed: boolean("hand_wand_allowed").default(false),
  ulvAllowed: boolean("ulv_allowed").default(false),
  chemigationAllowed: boolean("chemigation_allowed").default(false),
  // Use site categories
  useSites: json("use_sites"), // ['corn', 'soy', 'wheat', 'residential_indoor', 'residential_outdoor']
  // Label references
  labelPdfUrl: text("label_pdf_url"),
  sdsUrl: text("sds_url"),
  manufacturerUrl: text("manufacturer_url"),
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductNew = typeof productsNew.$inferSelect;
export type InsertProductNew = typeof productsNew.$inferInsert;

// ProductUse table (rate ranges by crop/pest)
export const productUse = pgTable("product_use", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").notNull().references(() => productsNew.id, { onDelete: "cascade" }),
  // Use context
  crop: varchar("crop", { length: 100 }),
  pest: varchar("pest", { length: 100 }),
  siteCategory: varchar("site_category", { length: 100 }),
  // Rate limits
  minRate: numeric("min_rate", { precision: 10, scale: 4 }),
  maxRate: numeric("max_rate", { precision: 10, scale: 4 }),
  rateUnit: varchar("rate_unit", { length: 50 }),
  // Application limits
  maxApplicationsPerSeason: integer("max_applications_per_season"),
  maxTotalPerSeason: numeric("max_total_per_season", { precision: 10, scale: 4 }),
  maxTotalUnit: varchar("max_total_unit", { length: 50 }),
  // Carrier volume
  minCarrierVolume: numeric("min_carrier_volume", { precision: 10, scale: 2 }),
  maxCarrierVolume: numeric("max_carrier_volume", { precision: 10, scale: 2 }),
  carrierUnit: varchar("carrier_unit", { length: 50 }),
  // Intervals
  phiDays: integer("phi_days"),
  reiHours: integer("rei_hours"),
  reentryConditions: text("reentry_conditions"),
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductUse = typeof productUse.$inferSelect;
export type InsertProductUse = typeof productUse.$inferInsert;

// Service Plans table (for recurring pest control services)
export const servicePlans = pgTable("service_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  siteId: integer("site_id").references(() => sites.id),
  // Plan details
  planName: varchar("plan_name", { length: 255 }).notNull(),
  planType: servicePlanTypeEnum("plan_type").notNull(),
  // Scheduling
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextServiceDate: date("next_service_date"),
  // Service details
  defaultZones: json("default_zones"), // [zone_id1, zone_id2]
  defaultProducts: json("default_products"), // [{product_id, rate}]
  defaultTargetPests: json("default_target_pests"), // ['Ants', 'Spiders', 'Roaches']
  // Pricing
  pricePerService: numeric("price_per_service", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  // Status
  status: servicePlanStatusEnum("status").default("active"),
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServicePlan = typeof servicePlans.$inferSelect;
export type InsertServicePlan = typeof servicePlans.$inferInsert;

// Jobs table (updated with new fields)
export const jobs = pgTable("jobs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  customerId: integer("customer_id").references(() => customers.id),
  siteId: integer("site_id").references(() => sites.id), // NEW: Link to site
  assignedPersonnelId: integer("assigned_personnel_id").references(() => personnel.id),
  equipmentId: integer("equipment_id").references(() => equipment.id), // NEW: Link to equipment
  servicePlanId: integer("service_plan_id").references(() => servicePlans.id), // NEW: Link to service plan
  title: text("title").notNull(),
  description: text("description"),
  jobType: jobTypeEnum("job_type").notNull(),
  statusId: integer("status_id").references(() => jobStatuses.id),
  priority: priorityEnum("priority").default("medium").notNull(),
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
  // NEW: Additional fields
  acres: numeric("acres", { precision: 10, scale: 2 }),
  carrierVolume: numeric("carrier_volume", { precision: 10, scale: 2 }),
  carrierUnit: varchar("carrier_unit", { length: 50 }).default("GPA"),
  numLoads: integer("num_loads"),
  zonesToTreat: json("zones_to_treat"), // [zone_id1, zone_id2]
  weatherConditions: varchar("weather_conditions", { length: 255 }),
  temperatureF: numeric("temperature_f", { precision: 5, scale: 2 }),
  windSpeedMph: numeric("wind_speed_mph", { precision: 5, scale: 2 }),
  windDirection: varchar("wind_direction", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Applications table (historical records)
export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  siteId: integer("site_id").references(() => sites.id),
  customerId: integer("customer_id").references(() => customers.id),
  // Personnel
  applicatorId: integer("applicator_id").references(() => personnel.id),
  supervisorId: integer("supervisor_id").references(() => personnel.id),
  // Equipment
  equipmentId: integer("equipment_id").references(() => equipment.id),
  // Application details
  applicationDate: date("application_date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  // Products applied
  productsApplied: json("products_applied"), // [{product_id, epa_reg_number, amount, unit, rate, carrier_volume}]
  // Area treated
  acresTreated: numeric("acres_treated", { precision: 10, scale: 2 }),
  areaUnit: varchar("area_unit", { length: 20 }).default("acres"),
  // Method
  applicationMethod: applicationMethodEnum("application_method").notNull(),
  // Conditions
  temperatureF: numeric("temperature_f", { precision: 5, scale: 2 }),
  windSpeedMph: numeric("wind_speed_mph", { precision: 5, scale: 2 }),
  windDirection: varchar("wind_direction", { length: 10 }),
  humidityPercent: numeric("humidity_percent", { precision: 5, scale: 2 }),
  weatherConditions: varchar("weather_conditions", { length: 255 }),
  // Target
  targetPest: varchar("target_pest", { length: 255 }),
  crop: varchar("crop", { length: 100 }),
  // Compliance
  phiDate: date("phi_date"),
  reiDatetime: timestamp("rei_datetime"),
  // Record keeping
  completedById: integer("completed_by_id").references(() => users.id),
  verifiedById: integer("verified_by_id").references(() => users.id),
  verificationDate: date("verification_date"),
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Products table (legacy - keep for backward compatibility)
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  epaNumber: varchar("epa_number", { length: 100 }),
  manufacturer: text("manufacturer"),
  activeIngredients: text("active_ingredients"),
  productType: varchar("product_type", { length: 100 }),
  applicationRate: text("application_rate"),
  safetyNotes: text("safety_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// AI Conversations table
export const aiConversations = pgTable("ai_conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

// AI Messages table
export const aiMessages = pgTable("ai_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull().references(() => aiConversations.id),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;

// AI Usage tracking table
export const aiUsage = pgTable("ai_usage", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  conversationId: integer("conversation_id").references(() => aiConversations.id),
  model: varchar("model", { length: 100 }).notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  cost: varchar("cost", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;

// Maps table for KML/GPX/GeoJSON file uploads
export const maps = pgTable("maps", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  fileType: fileTypeEnum("file_type").notNull(),
  publicUrl: text("public_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Map = typeof maps.$inferSelect;
export type InsertMap = typeof maps.$inferInsert;
