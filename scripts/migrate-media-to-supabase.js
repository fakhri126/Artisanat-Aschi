/**
 * Script de migration automatique des médias (images & vidéos) vers Supabase Storage
 * 
 * Utilisation :
 *   $env:SUPABASE_KEY="eyJhbGciOi..."; node scripts/migrate-media-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client: PgClient } = require('pg');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uerbqswgxsinayfyntsm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

async function migrate() {
  console.log('===============================================================');
  console.log('🚀 MIGRATION DES MÉDIAS (IMAGES & VIDÉOS) VERS SUPABASE STORAGE');
  console.log('===============================================================');

  if (!SUPABASE_KEY) {
    console.error('\n❌ ERREUR : La clé API Supabase est manquante !');
    console.error('Veuillez définir la variable d\'environnement SUPABASE_KEY ou SUPABASE_SERVICE_ROLE_KEY.');
    console.error('Exemple :');
    console.error('  $env:SUPABASE_KEY="eyJhbGciOi..."; node scripts/migrate-media-to-supabase.js\n');
    process.exit(1);
  }

  // 1. Initialiser le client Supabase et PostgreSQL
  console.log('1. Connexion à Supabase Storage & PostgreSQL...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });

  const pgClient = new PgClient({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();
  console.log('✅ Connecté à PostgreSQL Supabase.');

  // 2. Vérifier / Créer le bucket 'media'
  console.log(`\n2. Vérification du bucket '${BUCKET_NAME}' sur Supabase Storage...`);
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error('❌ Impossible de lister les buckets:', bucketsErr.message);
  }

  const bucketExists = buckets && buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`  + Création du bucket public '${BUCKET_NAME}'...`);
    const { data: newBucket, error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 104857600 // 100 MB max
    });
    if (createErr) {
      console.warn(`  ⚠️ Création de bucket via API : ${createErr.message}. Tentative d'insertion SQL directe...`);
      await pgClient.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true, 104857600)
        ON CONFLICT (id) DO UPDATE SET public = true;
      `).catch(e => console.warn('SQL Bucket warn:', e.message));
    } else {
      console.log(`  ✅ Bucket public '${BUCKET_NAME}' créé avec succès.`);
    }
  } else {
    console.log(`  ✅ Bucket '${BUCKET_NAME}' déjà existant.`);
  }

  // 3. Récupérer la liste des fichiers locaux
  const pubFiles = fs.existsSync(publicUploads) ? fs.readdirSync(publicUploads) : [];
  const backFiles = fs.existsSync(backendUploads) ? fs.readdirSync(backendUploads) : [];
  const allFiles = Array.from(new Set([...pubFiles, ...backFiles])).filter(f => f !== '.gitkeep');

  console.log(`\n3. Upload de ${allFiles.length} fichiers vers Supabase Storage...`);

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
  console.log(`  - Réussis : ${successCount}`);
  console.log(`  - Échecs   : ${errorCount}`);

  // 4. Mettre à jour les références en base de données PostgreSQL
  console.log('\n4. Mise à jour des URLs dans la base de données PostgreSQL...');
  const publicBaseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

  // 4.1 Projets (image_url et video_url)
  const projects = (await pgClient.query("SELECT id, title, image_url, video_url FROM projects")).rows;
  let updatedProjects = 0;

  for (const proj of projects) {
    let newImageUrl = proj.image_url;
    let newVideoUrl = proj.video_url;

    if (newImageUrl) {
      const parts = newImageUrl.split(',').map(s => s.trim());
      const updatedParts = parts.map(part => {
        const cleanName = path.basename(part);
        if (part.includes('/uploads/') || part.includes('localhost:8081')) {
          return `${publicBaseUrl}${cleanName}`;
        }
        return part;
      });
      newImageUrl = updatedParts.join(',');
    }

    if (newVideoUrl && (newVideoUrl.includes('/uploads/') || newVideoUrl.includes('localhost:8081'))) {
      const cleanVideoName = path.basename(newVideoUrl);
      newVideoUrl = `${publicBaseUrl}${cleanVideoName}`;
    }

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
    if (pImg.image_url && (pImg.image_url.includes('/uploads/') || pImg.image_url.includes('localhost:8081'))) {
      const cleanName = path.basename(pImg.image_url);
      const newUrl = `${publicBaseUrl}${cleanName}`;
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
    if (n.image_url && (n.image_url.includes('/uploads/') || n.image_url.includes('localhost:8081'))) {
      const cleanName = path.basename(n.image_url);
      const newUrl = `${publicBaseUrl}${cleanName}`;
      await pgClient.query("UPDATE news SET image_url = $1 WHERE id = $2", [newUrl, n.id]);
      updatedNews++;
    }
  }
  console.log(`  Actualités mises à jour : ${updatedNews}/${newsRows.length}`);

  // 4.4 Bijoux boards
  const bijouxRows = (await pgClient.query("SELECT id, image FROM bijoux_boards").catch(() => ({ rows: [] }))).rows;
  let updatedBijoux = 0;
  for (const b of bijouxRows) {
    if (b.image && (b.image.includes('/uploads/') || b.image.includes('localhost:8081'))) {
      const cleanName = path.basename(b.image);
      const newUrl = `${publicBaseUrl}${cleanName}`;
      await pgClient.query("UPDATE bijoux_boards SET image = $1 WHERE id = $2", [newUrl, b.id]);
      updatedBijoux++;
    }
  }
  if (bijouxRows.length > 0) {
    console.log(`  Bijoux boards actualisés : ${updatedBijoux}/${bijouxRows.length}`);
  }

  await pgClient.end();

  console.log('\n===============================================================');
  console.log('🎉 MIGRATION COMPLÈTE VERS SUPABASE STORAGE TERMINÉE !');
  console.log(`📁 Bucket public : ${BUCKET_NAME}`);
  console.log(`🌐 Base URL : ${publicBaseUrl}`);
  console.log('===============================================================\n');
}

migrate().catch(err => {
  console.error('❌ Erreur inattendue pendant la migration :', err);
  process.exit(1);
});
