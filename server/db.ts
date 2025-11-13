import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, equipment, InsertEquipment, maintenanceTasks, InsertMaintenanceTask, servicePlans, InsertServicePlan } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  // Build Supabase connection string with password from secret (using Session Pooler for IPv4 compatibility)
  const supabasePassword = process.env.R2S_Supabase;
  const supabaseUrl = supabasePassword 
    ? `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
    : null;
  
  const connectionString = supabaseUrl || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!_db && connectionString) {
    try {
      const client = postgres(connectionString, {
        ssl: { rejectUnauthorized: false },
        max: 1,
        idle_timeout: 0,
        max_lifetime: 60 * 30,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert syntax
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Organization helpers
export async function getOrCreateUserOrganization(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { organizations } = await import("../drizzle/schema");
  
  // Check if user already has an organization
  const existing = await db.select().from(organizations).where(eq(organizations.ownerId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new organization for user - PostgreSQL returns the inserted row
  const result = await db.insert(organizations).values({
    name: `Organization ${userId}`,
    ownerId: userId,
  }).returning();
  
  return result[0];
}

export async function updateOrganization(orgId: number, data: Partial<{
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { organizations } = await import("../drizzle/schema");
  
  const result = await db.update(organizations)
    .set(data)
    .where(eq(organizations.id, orgId))
    .returning();
  
  return result[0];
}

export async function getOrganizationById(orgId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { organizations } = await import("../drizzle/schema");
  const result = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Customer helpers
export async function getCustomersByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { customers } = await import("../drizzle/schema");
  return await db.select().from(customers).where(eq(customers.orgId, orgId));
}

export async function createCustomer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { customers } = await import("../drizzle/schema");
  const result = await db.insert(customers).values(data).returning();
  return result[0];
}

export async function updateCustomer(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { customers } = await import("../drizzle/schema");
  const result = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
  return result[0];
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { customers } = await import("../drizzle/schema");
  await db.delete(customers).where(eq(customers.id, id));
}

// Job helpers
export async function getJobsByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { jobs, jobStatuses } = await import("../drizzle/schema");
  
  // Join jobs with job_statuses to get status name and color
  const result = await db
    .select({
      id: jobs.id,
      orgId: jobs.orgId,
      customerId: jobs.customerId,
      assignedPersonnelId: jobs.assignedPersonnelId,
      title: jobs.title,
      description: jobs.description,
      jobType: jobs.jobType,
      statusId: jobs.statusId,
      priority: jobs.priority,
      locationAddress: jobs.locationAddress,
      locationLat: jobs.locationLat,
      locationLng: jobs.locationLng,
      scheduledStart: jobs.scheduledStart,
      scheduledEnd: jobs.scheduledEnd,
      actualStart: jobs.actualStart,
      actualEnd: jobs.actualEnd,
      notes: jobs.notes,
      state: jobs.state,
      commodityCrop: jobs.commodityCrop,
      targetPest: jobs.targetPest,
      epaNumber: jobs.epaNumber,
      applicationRate: jobs.applicationRate,
      applicationMethod: jobs.applicationMethod,
      chemicalProduct: jobs.chemicalProduct,
      reEntryInterval: jobs.reEntryInterval,
      preharvestInterval: jobs.preharvestInterval,
      maxApplicationsPerSeason: jobs.maxApplicationsPerSeason,
      maxRatePerSeason: jobs.maxRatePerSeason,
      methodsAllowed: jobs.methodsAllowed,
      rate: jobs.rate,
      diluentAerial: jobs.diluentAerial,
      diluentGround: jobs.diluentGround,
      diluentChemigation: jobs.diluentChemigation,
      genericConditions: jobs.genericConditions,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      // Status fields from jobStatuses table
      statusName: jobStatuses.name,
      statusColor: jobStatuses.color,
      statusCategory: jobStatuses.category,
    })
    .from(jobs)
    .leftJoin(jobStatuses, eq(jobs.statusId, jobStatuses.id))
    .where(eq(jobs.orgId, orgId));
  
  return result;
}

export async function createJob(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  const result = await db.insert(jobs).values(data).returning();
  return result[0];
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { jobs } = await import("../drizzle/schema");
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0] || null;
}

export async function updateJob(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  const result = await db.update(jobs).set(data).where(eq(jobs.id, id)).returning();
  return result[0];
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  await db.delete(jobs).where(eq(jobs.id, id));
}

// Job Status helpers
export async function getJobStatusesByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { jobStatuses } = await import("../drizzle/schema");
  const { asc } = await import("drizzle-orm");
  return await db.select().from(jobStatuses).where(eq(jobStatuses.orgId, orgId)).orderBy(asc(jobStatuses.displayOrder));
}

export async function createJobStatus(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobStatuses } = await import("../drizzle/schema");
  const result = await db.insert(jobStatuses).values(data).returning();
  return result[0];
}

export async function updateJobStatus(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobStatuses } = await import("../drizzle/schema");
  const result = await db.update(jobStatuses).set(data).where(eq(jobStatuses.id, id)).returning();
  return result[0];
}

export async function deleteJobStatus(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobStatuses } = await import("../drizzle/schema");
  await db.delete(jobStatuses).where(eq(jobStatuses.id, id));
}

export async function reorderJobStatuses(statusIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobStatuses } = await import("../drizzle/schema");
  
  // Update each status with its new display order
  for (let i = 0; i < statusIds.length; i++) {
    await db.update(jobStatuses)
      .set({ displayOrder: i })
      .where(eq(jobStatuses.id, statusIds[i]));
  }
}

export async function getDefaultJobStatus(orgId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { jobStatuses } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(jobStatuses).where(
    and(eq(jobStatuses.orgId, orgId), eq(jobStatuses.isDefault, true))
  ).limit(1);
  return result[0] || null;
}

// Job Status History helpers
export async function createJobStatusHistory(data: {
  jobId: number;
  fromStatusId: number | null;
  toStatusId: number;
  changedByUserId: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobStatusHistory } = await import("../drizzle/schema");
  const result = await db.insert(jobStatusHistory).values(data).returning();
  return result[0];
}

export async function getJobStatusHistory(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { jobStatusHistory, jobStatuses, users } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  // Join with job_statuses and users to get status names and user names
  const result = await db
    .select({
      id: jobStatusHistory.id,
      jobId: jobStatusHistory.jobId,
      fromStatusId: jobStatusHistory.fromStatusId,
      toStatusId: jobStatusHistory.toStatusId,
      changedByUserId: jobStatusHistory.changedByUserId,
      notes: jobStatusHistory.notes,
      createdAt: jobStatusHistory.createdAt,
      fromStatusName: jobStatuses.name,
      toStatusName: jobStatuses.name,
      changedByUserName: users.name,
    })
    .from(jobStatusHistory)
    .leftJoin(jobStatuses, eq(jobStatusHistory.fromStatusId, jobStatuses.id))
    .leftJoin(jobStatuses, eq(jobStatusHistory.toStatusId, jobStatuses.id))
    .leftJoin(users, eq(jobStatusHistory.changedByUserId, users.id))
    .where(eq(jobStatusHistory.jobId, jobId))
    .orderBy(desc(jobStatusHistory.createdAt));
    
  return result;
}

// Personnel helpers
export async function getPersonnelByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { personnel } = await import("../drizzle/schema");
  return await db.select().from(personnel).where(eq(personnel.orgId, orgId));
}

export async function createPersonnel(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { personnel } = await import("../drizzle/schema");
  const result = await db.insert(personnel).values(data).returning();
  return result[0];
}

export async function updatePersonnel(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { personnel } = await import("../drizzle/schema");
  const result = await db.update(personnel).set(data).where(eq(personnel.id, id)).returning();
  return result[0];
}

export async function deletePersonnel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { personnel } = await import("../drizzle/schema");
  await db.delete(personnel).where(eq(personnel.id, id));
}

// Product helpers
export async function getProductsByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { products } = await import("../drizzle/schema");
  return await db.select().from(products).where(eq(products.orgId, orgId));
}

// AI Conversation helpers
export async function getConversationsByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { aiConversations } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return await db.select().from(aiConversations).where(eq(aiConversations.orgId, orgId)).orderBy(desc(aiConversations.createdAt));
}

export async function createConversation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aiConversations } = await import("../drizzle/schema");
  const result = await db.insert(aiConversations).values(data).returning();
  return result[0];
}

// AI Message helpers
export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { aiMessages } = await import("../drizzle/schema");
  const { asc } = await import("drizzle-orm");
  return await db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(asc(aiMessages.createdAt));
}

export async function createMessage(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aiMessages } = await import("../drizzle/schema");
  const result = await db.insert(aiMessages).values(data).returning();
  return result[0];
}

// Map helpers
export async function getMapsByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { maps } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return await db.select().from(maps).where(eq(maps.orgId, orgId)).orderBy(desc(maps.createdAt));
}

export async function createMap(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { maps } = await import("../drizzle/schema");
  const result = await db.insert(maps).values(data).returning();
  return result[0];
}

export async function deleteMap(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { maps } = await import("../drizzle/schema");
  await db.delete(maps).where(eq(maps.id, id));
}

// Sites functions
export async function getSitesByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { sites, customers } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  // Join with customers to get customer name
  const result = await db
    .select({
      id: sites.id,
      orgId: sites.orgId,
      customerId: sites.customerId,
      customerName: customers.name,
      name: sites.name,
      siteType: sites.siteType,
      address: sites.address,
      city: sites.city,
      state: sites.state,
      zipCode: sites.zipCode,
      polygon: sites.polygon,
      centerLat: sites.centerLat,
      centerLng: sites.centerLng,
      acres: sites.acres,
      crop: sites.crop,
      variety: sites.variety,
      growthStage: sites.growthStage,
      sensitiveAreas: sites.sensitiveAreas,
      propertyType: sites.propertyType,
      units: sites.units,
      notes: sites.notes,
      createdAt: sites.createdAt,
      updatedAt: sites.updatedAt,
    })
    .from(sites)
    .leftJoin(customers, eq(sites.customerId, customers.id))
    .where(eq(sites.orgId, orgId))
    .orderBy(desc(sites.createdAt));
  
  return result;
}

export async function getSiteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { sites, customers } = await import("../drizzle/schema");
  
  const result = await db
    .select({
      id: sites.id,
      orgId: sites.orgId,
      customerId: sites.customerId,
      customerName: customers.name,
      name: sites.name,
      siteType: sites.siteType,
      address: sites.address,
      city: sites.city,
      state: sites.state,
      zipCode: sites.zipCode,
      polygon: sites.polygon,
      centerLat: sites.centerLat,
      centerLng: sites.centerLng,
      acres: sites.acres,
      crop: sites.crop,
      variety: sites.variety,
      growthStage: sites.growthStage,
      sensitiveAreas: sites.sensitiveAreas,
      propertyType: sites.propertyType,
      units: sites.units,
      notes: sites.notes,
      createdAt: sites.createdAt,
      updatedAt: sites.updatedAt,
    })
    .from(sites)
    .leftJoin(customers, eq(sites.customerId, customers.id))
    .where(eq(sites.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function createSite(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sites } = await import("../drizzle/schema");
  const result = await db.insert(sites).values(data).returning();
  return result[0];
}

export async function updateSite(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sites } = await import("../drizzle/schema");
  const result = await db.update(sites).set(data).where(eq(sites.id, id)).returning();
  return result[0];
}

export async function deleteSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sites } = await import("../drizzle/schema");
  await db.delete(sites).where(eq(sites.id, id));
}


// ============================================
// Integration Procedures
// ============================================

export async function getIntegrationConnections(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { integrationConnections } = await import("../drizzle/schema");
  return await db.select().from(integrationConnections).where(eq(integrationConnections.organizationId, organizationId));
}

export async function getIntegrationConnection(organizationId: number, integrationType: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { integrationConnections } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(integrationConnections).where(
    and(
      eq(integrationConnections.organizationId, organizationId),
      eq(integrationConnections.integrationType, integrationType)
    )
  ).limit(1);
  return result[0] || null;
}

export async function createIntegrationConnection(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { integrationConnections } = await import("../drizzle/schema");
  const result = await db.insert(integrationConnections).values(data).returning();
  return result[0];
}

export async function updateIntegrationConnection(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { integrationConnections } = await import("../drizzle/schema");
  const result = await db.update(integrationConnections).set(data).where(eq(integrationConnections.id, id)).returning();
  return result[0];
}

export async function deleteIntegrationConnection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { integrationConnections } = await import("../drizzle/schema");
  await db.delete(integrationConnections).where(eq(integrationConnections.id, id));
}

export async function createSyncLog(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { integrationSyncLogs } = await import("../drizzle/schema");
  const result = await db.insert(integrationSyncLogs).values(data).returning();
  return result[0];
}

export async function getSyncLogs(connectionId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const { integrationSyncLogs } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return await db.select().from(integrationSyncLogs)
    .where(eq(integrationSyncLogs.connectionId, connectionId))
    .orderBy(desc(integrationSyncLogs.syncedAt))
    .limit(limit);
}

export async function getEntityMapping(connectionId: number, entityType: string, ready2sprayId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { integrationEntityMappings } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(integrationEntityMappings).where(
    and(
      eq(integrationEntityMappings.connectionId, connectionId),
      eq(integrationEntityMappings.entityType, entityType),
      eq(integrationEntityMappings.ready2sprayId, ready2sprayId)
    )
  ).limit(1);
  return result[0] || null;
}

export async function createEntityMapping(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { integrationEntityMappings } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  // Check if mapping already exists
  const existing = await db.select().from(integrationEntityMappings).where(
    and(
      eq(integrationEntityMappings.connectionId, data.connectionId),
      eq(integrationEntityMappings.entityType, data.entityType),
      eq(integrationEntityMappings.ready2sprayId, data.ready2sprayId)
    )
  ).limit(1);
  
  if (existing.length > 0) {
    // Update existing mapping
    const result = await db.update(integrationEntityMappings)
      .set({ externalId: data.externalId, lastSyncedAt: new Date() })
      .where(eq(integrationEntityMappings.id, existing[0].id))
      .returning();
    return result[0];
  } else {
    // Create new mapping
    const result = await db.insert(integrationEntityMappings).values({
      ...data,
      lastSyncedAt: new Date()
    }).returning();
    return result[0];
  }
}


// ============================================================================
// Equipment Functions
// ============================================================================

export async function getEquipmentByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(equipment).where(eq(equipment.orgId, orgId));
  return result;
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEquipment(data: InsertEquipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(equipment).values(data);
}

export async function updateEquipment(id: number, data: Partial<InsertEquipment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(equipment).set(data).where(eq(equipment.id, id));
}

export async function deleteEquipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(equipment).where(eq(equipment.id, id));
}


// ============================================================================
// Maintenance Tasks
// ============================================================================

export async function getMaintenanceTasksByEquipmentId(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(maintenanceTasks)
    .where(eq(maintenanceTasks.equipmentId, equipmentId))
    .orderBy(maintenanceTasks.nextDueDate);
  
  return result;
}

export async function getAllMaintenanceTasks(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all equipment for this org first
  const orgEquipment = await getEquipmentByOrgId(orgId);
  const equipmentIds = orgEquipment.map(e => e.id);
  
  if (equipmentIds.length === 0) return [];
  
  const result = await db
    .select()
    .from(maintenanceTasks)
    .where(sql`${maintenanceTasks.equipmentId} IN (${sql.join(equipmentIds.map(id => sql`${id}`), sql`, `)})`)
    .orderBy(maintenanceTasks.nextDueDate);
  
  return result;
}

export async function getMaintenanceTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(maintenanceTasks)
    .where(eq(maintenanceTasks.id, id))
    .limit(1);
  
  return result[0];
}

export async function createMaintenanceTask(task: InsertMaintenanceTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(maintenanceTasks).values(task).returning();
  return result[0];
}

export async function updateMaintenanceTask(id: number, updates: Partial<InsertMaintenanceTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(maintenanceTasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(maintenanceTasks.id, id))
    .returning();
  
  return result[0];
}

export async function completeMaintenanceTask(id: number, actualCost?: string, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const task = await getMaintenanceTaskById(id);
  if (!task) throw new Error("Task not found");
  
  const now = new Date();
  let nextDueDate: Date | null = null;
  
  // Calculate next due date if recurring
  if (task.isRecurring && task.frequencyType && task.frequencyValue) {
    switch (task.frequencyType) {
      case "hours":
        // For hours-based, we'd need equipment hours tracking
        // For now, skip automatic calculation
        break;
      case "days":
        nextDueDate = new Date(now);
        nextDueDate.setDate(nextDueDate.getDate() + task.frequencyValue);
        break;
      case "months":
        nextDueDate = new Date(now);
        nextDueDate.setMonth(nextDueDate.getMonth() + task.frequencyValue);
        break;
    }
  }
  
  const updates: Partial<InsertMaintenanceTask> = {
    status: "completed",
    lastCompletedDate: now,
    nextDueDate: nextDueDate,
    updatedAt: now,
  };
  
  if (actualCost) updates.actualCost = actualCost;
  if (notes) updates.notes = notes;
  
  const result = await db
    .update(maintenanceTasks)
    .set(updates)
    .where(eq(maintenanceTasks.id, id))
    .returning();
  
  return result[0];
}

export async function deleteMaintenanceTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(maintenanceTasks).where(eq(maintenanceTasks.id, id));
}


// ============= Service Plans =============

export async function getServicePlansByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(servicePlans)
    .where(eq(servicePlans.orgId, orgId))
    .orderBy(desc(servicePlans.createdAt));
  
  return result;
}

export async function getServicePlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(servicePlans)
    .where(eq(servicePlans.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createServicePlan(plan: InsertServicePlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(servicePlans).values(plan).returning();
  return result[0];
}

export async function updateServicePlan(id: number, plan: Partial<InsertServicePlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(servicePlans)
    .set({ ...plan, updatedAt: new Date() })
    .where(eq(servicePlans.id, id))
    .returning();
  
  return result[0];
}

export async function deleteServicePlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(servicePlans).where(eq(servicePlans.id, id));
}
