import postgres from 'postgres';

const supabasePassword = process.env.R2S_Supabase;
const supabaseUrl = `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`;

const client = postgres(supabaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  console.log('Adding missing columns to jobs table...');
  
  await client`
    ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS equipment_id INTEGER,
      ADD COLUMN IF NOT EXISTS site_id INTEGER,
      ADD COLUMN IF NOT EXISTS service_plan_id INTEGER,
      ADD COLUMN IF NOT EXISTS product_id INTEGER,
      ADD COLUMN IF NOT EXISTS status_id INTEGER,
      ADD COLUMN IF NOT EXISTS acres NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS carrier_volume NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS carrier_unit VARCHAR(50) DEFAULT 'GPA',
      ADD COLUMN IF NOT EXISTS num_loads INTEGER,
      ADD COLUMN IF NOT EXISTS zones_to_treat JSONB,
      ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(255),
      ADD COLUMN IF NOT EXISTS temperature_f NUMERIC(5, 2),
      ADD COLUMN IF NOT EXISTS wind_speed_mph NUMERIC(5, 2),
      ADD COLUMN IF NOT EXISTS wind_direction VARCHAR(10)
  `;
  
  console.log('✓ Columns added successfully');
  
  // Verify
  const columns = await client`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    ORDER BY ordinal_position
  `;
  
  console.log(`✓ Jobs table now has ${columns.length} columns`);
  
} catch (error) {
  console.error('✗ Error:', error.message);
} finally {
  await client.end();
}
