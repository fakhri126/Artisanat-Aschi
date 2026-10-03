/**
 * Script de migration automatique des médias (images & vidéos) vers Supabase Storage
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client: PgClient } = require('pg');

// Lire le fichier .env si présent
if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SUPABASE_KEY || 
                     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcmJxc3dneHNpbmF5ZnludHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcyMTcsImV4cCI6MjEwMzg4MzIxN30.xoxyBPIb5ZOxM5ggsIsgPxyMF2K8BjO9_JwE8mtKygI';
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';
const BUCKET_NAME = 'media';

const publicUploads = path.join(process.cwd(), 'public', 'uploads');
const backendUploads = path.join(process.cwd(), 'backend', 'uploads');

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    default:
      return 'application/octet-stream';
  }
}

function replaceUploadUrl(url, publicBaseUrl) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/uploads/') && !url.includes('localhost:8081')) return url;

  const [cleanPath, hash] = url.split('#');
  const filename = path.basename(cleanPath);
  const newUrl = `${publicBaseUrl}${filename}${hash ? '#' + hash : ''}`;
  return newUrl;
}

function replaceCommaSeparatedUrls(urlsString, publicBaseUrl) {
  if (!urlsString || typeof urlsString !== 'string') return urlsString;
  const parts = urlsString.split(',').map(s => s.trim());
  return parts.map(part => replaceUploadUrl(part, publicBaseUrl)).join(',');
}

async function migrate() {
  console.log('===============================================================');
  console.log('🚀 MIGRATION DES MÉDIAS (IMAGES & VIDÉOS) VERS SUPABASE STORAGE');
  console.log('===============================================================');

  // 1. Initialiser le client Supabase
  console.log('\n1. Initialisation du client Supabase Storage...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  console.log('✅ Client Supabase prêt.');

  // 2. Récupérer les fichiers déjà présents sur Supabase Storage
  console.log(`\n2. Vérification des fichiers déjà téléversés dans le bucket '${BUCKET_NAME}'...`);
  const { data: existingFilesData, error: listErr } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1000 });
  const existingSet = new Set((existingFilesData || []).map(f => f.name));
  console.log(`  ℹ️ ${existingSet.size} fichiers déjà présents sur Supabase Storage.`);

  // 3. Récupérer la liste des fichiers locaux actifs
  const pubFiles = fs.existsSync(publicUploads) ? fs.readdirSync(publicUploads) : [];
  const backFiles = fs.existsSync(backendUploads) ? fs.readdirSync(backendUploads) : [];
  const allFiles = Array.from(new Set([...pubFiles, ...backFiles])).filter(f => f !== '.gitkeep' && !f.startsWith('.'));

  console.log(`\n3. Upload des fichiers manquants vers Supabase Storage (total : ${allFiles.length})...`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const filename = allFiles[i];
    let filePath = path.join(publicUploads, filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(backendUploads, filename);
    }

    if (!fs.existsSync(filePath)) continue;

    if (existingSet.has(filename)) {
      skippedCount++;
      successCount++;
      continue;
    }

    const mimeType = getMimeType(filename);
    const fileStat = fs.statSync(filePath);
    const sizeMb = (fileStat.size / (1024 * 1024)).toFixed(2);

    process.stdout.write(`  [${i + 1}/${allFiles.length}] Upload de ${filename} (${sizeMb} MB)... `);

    try {
      const fileBuffer = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        console.log(`❌ ERREUR: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ OK`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ EXCEPTION: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\nRésultat du téléversement :`);
  console.log(`  - Total présents : ${successCount}`);
  console.log(`  - Nouveaux envoyés : ${successCount - skippedCount}`);
  console.log(`  - Déjà présents : ${skippedCount}`);
  console.log(`  - Échecs : ${errorCount}`);

  // 4. Mettre à jour les références en base de données PostgreSQL
  console.log('\n4. Connexion à PostgreSQL et mise à jour des URLs...');
  const pgClient = new PgClient({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  pgClient.on('error', err => console.warn('PG warning (non-fatal):', err.message));
  await pgClient.connect();
  console.log('✅ Connecté à PostgreSQL Supabase.');

  console.log('  + Élargissement des colonnes URL en type TEXT...');
  await pgClient.query(`
    ALTER TABLE projects ALTER COLUMN image_url TYPE TEXT;
    ALTER TABLE projects ALTER COLUMN video_url TYPE TEXT;
    ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT;
    ALTER TABLE news ALTER COLUMN image_url TYPE TEXT;
    ALTER TABLE bijoux_boards ALTER COLUMN image TYPE TEXT;
    DO $$ BEGIN ALTER TABLE relookings ALTER COLUMN image_avant_url TYPE TEXT; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE relookings ALTER COLUMN image_apres_url TYPE TEXT; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE deliveries ALTER COLUMN image_url TYPE TEXT; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE testimonials ALTER COLUMN image_url TYPE TEXT; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE testimonials ALTER COLUMN video_url TYPE TEXT; EXCEPTION WHEN others THEN null; END $$;
  `).catch(e => console.warn('Alter tables warning:', e.message));

  const publicBaseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

  // 4.1 Projets (image_url et video_url)
  const projects = (await pgClient.query("SELECT id, title, image_url, video_url FROM projects")).rows;
  let updatedProjects = 0;

  for (const proj of projects) {
    const newImageUrl = replaceCommaSeparatedUrls(proj.image_url, publicBaseUrl);
    const newVideoUrl = replaceUploadUrl(proj.video_url, publicBaseUrl);

    if (newImageUrl !== proj.image_url || newVideoUrl !== proj.video_url) {
      await pgClient.query(
        "UPDATE projects SET image_url = $1, video_url = $2 WHERE id = $3",
        [newImageUrl, newVideoUrl, proj.id]
      );
      updatedProjects++;
      console.log(`  + Projet mis à jour [ID ${proj.id}] : "${proj.title}"`);
    }
  }
  console.log(`  Projets actualisés : ${updatedProjects}/${projects.length}`);

  // 4.2 Product Images (table product_images)
  const productImages = (await pgClient.query("SELECT id, image_url FROM product_images")).rows;
  let updatedProdImages = 0;

  for (const pImg of productImages) {
    const newUrl = replaceUploadUrl(pImg.image_url, publicBaseUrl);
    if (newUrl !== pImg.image_url) {
      await pgClient.query(
        "UPDATE product_images SET image_url = $1 WHERE id = $2",
        [newUrl, pImg.id]
      );
      updatedProdImages++;
    }
  }
  console.log(`  Images de produits actualisées : ${updatedProdImages}/${productImages.length}`);

  // 4.3 News (table news)
  const newsRows = (await pgClient.query("SELECT id, title, image_url FROM news")).rows;
  let updatedNews = 0;
  for (const n of newsRows) {
    const newUrl = replaceUploadUrl(n.image_url, publicBaseUrl);
    if (newUrl !== n.image_url) {
      await pgClient.query("UPDATE news SET image_url = $1 WHERE id = $2", [newUrl, n.id]);
      updatedNews++;
    }
  }
  console.log(`  Actualités mises à jour : ${updatedNews}/${newsRows.length}`);

  // 4.4 Bijoux boards
  const bijouxRows = (await pgClient.query("SELECT id, image FROM bijoux_boards").catch(() => ({ rows: [] }))).rows;
  let updatedBijoux = 0;
  for (const b of bijouxRows) {
    const newUrl = replaceUploadUrl(b.image, publicBaseUrl);
    if (newUrl !== b.image) {
      await pgClient.query("UPDATE bijoux_boards SET image = $1 WHERE id = $2", [newUrl, b.id]);
      updatedBijoux++;
    }
  }
  if (bijouxRows.length > 0) {
    console.log(`  Bijoux boards actualisés : ${updatedBijoux}/${bijouxRows.length}`);
  }

  // 4.5 Relookings
  const relookingsRows = (await pgClient.query("SELECT id, image_avant_url, image_apres_url FROM relookings").catch(() => ({ rows: [] }))).rows;
  let updatedRelookings = 0;
  for (const r of relookingsRows) {
    const newAvant = replaceUploadUrl(r.image_avant_url, publicBaseUrl);
    const newApres = replaceUploadUrl(r.image_apres_url, publicBaseUrl);
    if (newAvant !== r.image_avant_url || newApres !== r.image_apres_url) {
      await pgClient.query("UPDATE relookings SET image_avant_url = $1, image_apres_url = $2 WHERE id = $3", [newAvant, newApres, r.id]);
      updatedRelookings++;
    }
  }
  if (relookingsRows.length > 0) {
    console.log(`  Relookings actualisés : ${updatedRelookings}/${relookingsRows.length}`);
  }

  // 4.6 Deliveries
  const deliveriesRows = (await pgClient.query("SELECT id, image_url FROM deliveries").catch(() => ({ rows: [] }))).rows;
  let updatedDeliveries = 0;
  for (const d of deliveriesRows) {
    const newUrl = replaceUploadUrl(d.image_url, publicBaseUrl);
    if (newUrl !== d.image_url) {
      await pgClient.query("UPDATE deliveries SET image_url = $1 WHERE id = $2", [newUrl, d.id]);
      updatedDeliveries++;
    }
  }
  if (deliveriesRows.length > 0) {
    console.log(`  Livraisons actualisées : ${updatedDeliveries}/${deliveriesRows.length}`);
  }

  // 4.7 Testimonials
  const testimonialsRows = (await pgClient.query("SELECT id, image_url, video_url FROM testimonials").catch(() => ({ rows: [] }))).rows;
  let updatedTestimonials = 0;
  for (const t of testimonialsRows) {
    const newImageUrl = replaceUploadUrl(t.image_url, publicBaseUrl);
    const newVideoUrl = replaceUploadUrl(t.video_url, publicBaseUrl);
    if (newImageUrl !== t.image_url || newVideoUrl !== t.video_url) {
      await pgClient.query("UPDATE testimonials SET image_url = $1, video_url = $2 WHERE id = $3", [newImageUrl, newVideoUrl, t.id]);
      updatedTestimonials++;
    }
  }
  if (testimonialsRows.length > 0) {
    console.log(`  Témoignages actualisés : ${updatedTestimonials}/${testimonialsRows.length}`);
  }

  await pgClient.end();

  console.log('\n===============================================================');
  console.log('🎉 MIGRATION COMPLÈTE VERS SUPABASE STORAGE TERMINÉE AVEC SUCCÈS !');
  console.log(`📁 Bucket public : ${BUCKET_NAME}`);
  console.log(`🌐 Base URL : ${publicBaseUrl}`);
  console.log('===============================================================\n');
}

migrate().catch(err => {
  console.error('❌ Erreur inattendue pendant la migration :', err);
  process.exit(1);
});
