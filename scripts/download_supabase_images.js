const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_DB = 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';
const BASE_STORAGE_URL = 'https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/';
const DEST_DIR = path.join(__dirname, '..', 'backend', 'uploads');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close(() => {
          fs.unlink(destPath, () => {});
          reject(new Error(`Status ${response.statusCode} for ${url}`));
        });
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const client = new Client({
    connectionString: SUPABASE_DB,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connecté à Supabase.');

    const res = await client.query("SELECT name FROM storage.objects WHERE bucket_id = 'media';");
    const objects = res.rows;
    console.log(`Nombre total de fichiers trouvés dans le bucket 'media' : ${objects.length}`);

    let downloaded = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < objects.length; i++) {
      const fileName = objects[i].name;
      const targetPath = path.join(DEST_DIR, fileName);

      if (fs.existsSync(targetPath)) {
        skipped++;
        continue;
      }

      const fileUrl = BASE_STORAGE_URL + encodeURIComponent(fileName);
      try {
        await downloadFile(fileUrl, targetPath);
        downloaded++;
        if (downloaded % 10 === 0 || downloaded === objects.length) {
          console.log(`[${i + 1}/${objects.length}] Téléchargé : ${fileName}`);
        }
      } catch (err) {
        errors++;
        console.error(`Erreur pour ${fileName}:`, err.message);
      }
    }

    console.log('\n--- Bilan du téléchargement ---');
    console.log(`Nouveaux fichiers téléchargés : ${downloaded}`);
    console.log(`Fichiers déjà présents ignorés : ${skipped}`);
    console.log(`Erreurs : ${errors}`);
    console.log(`Dossier local : ${DEST_DIR}`);
  } catch (err) {
    console.error('Erreur:', err.message);
  } finally {
    await client.end();
  }
}

main();
