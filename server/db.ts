import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
  
  // Create new organization for user
  const result = await db.insert(organizations).values({
    name: `Organization ${userId}`,
    ownerId: userId,
  });
  
  const insertId = Number(result[0].insertId);
  const newOrg = await db.select().from(organizations).where(eq(organizations.id, insertId)).limit(1);
  return newOrg[0];
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
  const result = await db.insert(customers).values(data);
  const insertId = Number(result[0].insertId);
  const newCustomer = await db.select().from(customers).where(eq(customers.id, insertId)).limit(1);
  return newCustomer[0];
}

export async function updateCustomer(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { customers } = await import("../drizzle/schema");
  await db.update(customers).set(data).where(eq(customers.id, id));
  const updated = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return updated[0];
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
  
  const { jobs } = await import("../drizzle/schema");
  return await db.select().from(jobs).where(eq(jobs.orgId, orgId));
}

export async function createJob(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  const result = await db.insert(jobs).values(data);
  const insertId = Number(result[0].insertId);
  const newJob = await db.select().from(jobs).where(eq(jobs.id, insertId)).limit(1);
  return newJob[0];
}

export async function updateJob(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  await db.update(jobs).set(data).where(eq(jobs.id, id));
  const updated = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return updated[0];
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { jobs } = await import("../drizzle/schema");
  await db.delete(jobs).where(eq(jobs.id, id));
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
  const result = await db.insert(personnel).values(data);
  const insertId = Number(result[0].insertId);
  const newPersonnel = await db.select().from(personnel).where(eq(personnel.id, insertId)).limit(1);
  return newPersonnel[0];
}

export async function updatePersonnel(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { personnel } = await import("../drizzle/schema");
  await db.update(personnel).set(data).where(eq(personnel.id, id));
  const updated = await db.select().from(personnel).where(eq(personnel.id, id)).limit(1);
  return updated[0];
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
  return await db.select().from(aiConversations).where(eq(aiConversations.orgId, orgId)).orderBy(aiConversations.createdAt);
}

export async function createConversation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aiConversations } = await import("../drizzle/schema");
  const result = await db.insert(aiConversations).values(data);
  const insertId = Number(result[0].insertId);
  const newConv = await db.select().from(aiConversations).where(eq(aiConversations.id, insertId)).limit(1);
  return newConv[0];
}

// AI Message helpers
export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { aiMessages } = await import("../drizzle/schema");
  return await db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(aiMessages.createdAt);
}

export async function createMessage(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aiMessages } = await import("../drizzle/schema");
  const result = await db.insert(aiMessages).values(data);
  const insertId = Number(result[0].insertId);
  const newMessage = await db.select().from(aiMessages).where(eq(aiMessages.id, insertId)).limit(1);
  return newMessage[0];
}

// Map helpers
export async function getMapsByOrgId(orgId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { maps } = await import("../drizzle/schema");
  return await db.select().from(maps).where(eq(maps.orgId, orgId)).orderBy(maps.createdAt);
}

export async function createMap(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { maps } = await import("../drizzle/schema");
  const result = await db.insert(maps).values(data);
  const insertId = Number(result[0].insertId);
  const newMap = await db.select().from(maps).where(eq(maps.id, insertId)).limit(1);
  return newMap[0];
}

export async function deleteMap(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { maps } = await import("../drizzle/schema");
  await db.delete(maps).where(eq(maps.id, id));
}
