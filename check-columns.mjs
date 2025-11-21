import postgres from 'postgres';

const supabasePassword = process.env.R2S_Supabase;
const supabaseUrl = `postgresql://postgres.yqimcvatzaldidmqmvtr:${encodeURIComponent(supabasePassword)}@aws-1-us-west-1.pooler.supabase.com:5432/postgres`;

const client = postgres(supabaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const columns = await client`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'jobs' 
  ORDER BY ordinal_position
`;

console.log('Jobs table columns:');
columns.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

await client.end();
