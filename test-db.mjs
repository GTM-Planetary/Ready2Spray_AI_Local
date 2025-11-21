import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Build Supabase connection string the same way as server/db.ts
const supabasePassword = process.env.R2S_Supabase;
const supabaseUrl = supabasePassword 
  ? `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
  : null;

const connectionString = supabaseUrl || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

console.log('Connecting to database...');
console.log('Using Supabase:', !!supabasePassword);

const client = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

const db = drizzle(client);

try {
  // Test connection
  const result = await client`SELECT NOW() as current_time`;
  console.log('✓ Database connected:', result[0].current_time);
  
  // Check if jobs table exists
  const tables = await client`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'jobs'
  `;
  
  console.log(`Found ${tables.length} table(s) named 'jobs'`);
  
  if (tables.length === 0) {
    console.log('Creating jobs table...');
    
    // Create jobs table
    await client`
      CREATE TABLE jobs (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        org_id INTEGER NOT NULL,
        customer_id INTEGER,
        site_id INTEGER,
        assigned_personnel_id INTEGER,
        equipment_id INTEGER,
        service_plan_id INTEGER,
        product_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        job_type VARCHAR(50) NOT NULL,
        status_id INTEGER,
        priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
        location_address TEXT,
        location_lat VARCHAR(50),
        location_lng VARCHAR(50),
        scheduled_start TIMESTAMP,
        scheduled_end TIMESTAMP,
        actual_start TIMESTAMP,
        actual_end TIMESTAMP,
        notes TEXT,
        state VARCHAR(100),
        commodity_crop VARCHAR(200),
        target_pest VARCHAR(200),
        epa_number VARCHAR(100),
        application_rate VARCHAR(100),
        application_method VARCHAR(100),
        chemical_product VARCHAR(200),
        re_entry_interval VARCHAR(100),
        preharvest_interval VARCHAR(100),
        max_applications_per_season VARCHAR(50),
        max_rate_per_season VARCHAR(100),
        methods_allowed VARCHAR(200),
        rate VARCHAR(100),
        diluent_aerial VARCHAR(100),
        diluent_ground VARCHAR(100),
        diluent_chemigation VARCHAR(100),
        generic_conditions TEXT,
        acres NUMERIC(10, 2),
        carrier_volume NUMERIC(10, 2),
        carrier_unit VARCHAR(50) DEFAULT 'GPA',
        num_loads INTEGER,
        zones_to_treat JSONB,
        weather_conditions VARCHAR(255),
        temperature_f NUMERIC(5, 2),
        wind_speed_mph NUMERIC(5, 2),
        wind_direction VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('✓ Jobs table created successfully');
  } else {
    console.log('✓ Jobs table already exists');
    
    // Check columns
    const columns = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      ORDER BY ordinal_position
    `;
    
    console.log(`✓ Jobs table has ${columns.length} columns`);
  }
  
} catch (error) {
  console.error('✗ Database error:', error.message);
  console.error('Full error:', error);
} finally {
  await client.end();
  process.exit(0);
}
