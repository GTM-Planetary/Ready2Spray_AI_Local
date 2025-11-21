import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc } from 'drizzle-orm';

// Build Supabase connection string
const supabasePassword = process.env.R2S_Supabase;
const supabaseUrl = supabasePassword 
  ? `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
  : null;

const connectionString = supabaseUrl || process.env.DATABASE_URL;

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

const db = drizzle(client);

try {
  console.log('Testing the exact query from getJobsV2WithRelations...');
  
  // Import schema
  const { jobs, customers, personnel, equipment } = await import('./drizzle/schema.js');
  
  const orgId = 26; // From the error message
  
  const result = await db
    .select({
      id: jobs.id,
      orgId: jobs.orgId,
      title: jobs.title,
      description: jobs.description,
      jobType: jobs.jobType,
      priority: jobs.priority,
      statusId: jobs.statusId,
      location: jobs.locationAddress,
      scheduledStart: jobs.scheduledStart,
      scheduledEnd: jobs.scheduledEnd,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      // Customer info
      customerId: jobs.customerId,
      customerName: customers.name,
      // Personnel info
      personnelId: jobs.assignedPersonnelId,
      personnelName: personnel.name,
      // Equipment info
      equipmentId: jobs.equipmentId,
      equipmentName: equipment.name,
      // Product info
      productId: jobs.productId,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(personnel, eq(jobs.assignedPersonnelId, personnel.id))
    .leftJoin(equipment, eq(jobs.equipmentId, equipment.id))
    .where(eq(jobs.orgId, orgId))
    .orderBy(desc(jobs.createdAt));
  
  console.log(`✓ Query successful! Found ${result.length} jobs`);
  console.log('Result:', JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('✗ Query failed:', error.message);
  console.error('Full error:', error);
} finally {
  await client.end();
  process.exit(0);
}
