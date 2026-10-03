const { Client } = require('pg');

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function setupStorage() {
  console.log('Connexion à Supabase PostgreSQL...');
  const client = new Client({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connecté.');

  console.log('1. Création du bucket "media" (public)...');
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit)
    VALUES ('media', 'media', true, 104857600)
    ON CONFLICT (id) DO UPDATE SET 
      public = true,
      file_size_limit = 104857600;
  `);
  console.log('✅ Bucket "media" configuré.');

  console.log('2. Configuration des permissions publiques (RLS) sur storage.objects...');
  try {
    await client.query(`
      DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
      CREATE POLICY "Public Access Media" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'media');

      DROP POLICY IF EXISTS "Public Upload Media" ON storage.objects;
      CREATE POLICY "Public Upload Media" ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'media');

      DROP POLICY IF EXISTS "Public Update Media" ON storage.objects;
      CREATE POLICY "Public Update Media" ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'media');
    `);
    console.log('✅ Politiques de lecture/écriture/mise à jour configurées.');
  } catch (e) {
    console.warn('⚠️ RLS policy warning:', e.message);
  }

  const checkBucket = await client.query("SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id='media'");
  console.log('Bucket actuel :', checkBucket.rows[0]);

  await client.end();
  console.log('🎉 Configuration du stockage Supabase terminée.');
}

setupStorage().catch(err => {
  console.error('❌ Erreur lors de la configuration du stockage :', err);
  process.exit(1);
});
