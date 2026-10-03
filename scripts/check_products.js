const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const res = await client.query(`
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE confrelid = 'products'::regclass;
  `);
  console.log('Constraints referencing products:', res.rows);

  await client.end();
}

main().catch(console.error);
