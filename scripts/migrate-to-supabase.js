/**
 * Script de migration automatique : Base Locale -> Supabase Cloud
 * 
 * Utilisation :
 *   node scripts/migrate-to-supabase.js
 * 
 * Vous pouvez aussi passer les variables d'environnement si les identifiants locaux diffèrent :
 *   LOCAL_DB_URL=postgres://postgres:adminpassword@localhost:5432/artisanat_aschi node scripts/migrate-to-supabase.js
 */

const { Client } = require('pg');

const LOCAL_URL = process.env.LOCAL_DB_URL || 'postgresql://postgres:adminpassword@localhost:5432/artisanat_aschi';
const SUPABASE_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function migrate() {
  console.log('----------------------------------------------------');
  console.log('🚀 MIGRATION DES PRODUITS : Base Locale -> Supabase');
  console.log('----------------------------------------------------');
  console.log('1. Connexion à la base locale...');
  const localClient = new Client({ connectionString: LOCAL_URL });
  
  console.log('2. Connexion à Supabase...');
  const supabaseClient = new Client({ 
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await localClient.connect();
    console.log('✅ Connecté à la base locale.');
  } catch (err) {
    console.error('❌ Impossible de se connecter à la base locale.');
    console.error('Détail :', err.message);
    console.log('\n💡 Conseil : Assurez-vous que Docker / PostgreSQL local est bien démarré sur votre machine.');
    console.log('Si votre mot de passe ou nom de base local est différent, lancez :');
    console.log('LOCAL_DB_URL=postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/NOM_BASE node scripts/migrate-to-supabase.js');
    process.exit(1);
  }

  try {
    await supabaseClient.connect();
    console.log('✅ Connecté à Supabase.');
  } catch (err) {
    console.error('❌ Impossible de se connecter à Supabase.');
    console.error('Détail :', err.message);
    await localClient.end();
    process.exit(1);
  }

  try {
    // 1. Synchroniser les Catégories
    console.log('\n📂 Synchronisation des catégories...');
    const localCats = (await localClient.query('SELECT * FROM categories ORDER BY id;')).rows;
    const supaCats = (await supabaseClient.query('SELECT * FROM categories ORDER BY id;')).rows;

    const supaCatMap = new Map();
    supaCats.forEach(c => supaCatMap.set(c.name.toLowerCase().trim(), c.id));

    let newCatsCount = 0;
    for (const lCat of localCats) {
      const key = lCat.name.toLowerCase().trim();
      if (!supaCatMap.has(key)) {
        const res = await supabaseClient.query(
          'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id;',
          [lCat.name, lCat.type || 'MOBILIER']
        );
        const newId = res.rows[0].id;
        supaCatMap.set(key, newId);
        newCatsCount++;
        console.log(`  + Nouvelle catégorie créée sur Supabase : "${lCat.name}"`);
      }
    }
    if (newCatsCount === 0) console.log('  Toutes les catégories sont déjà à jour.');

    // 2. Transférer les Produits
    console.log('\n📦 Analyse des produits locaux...');
    const localProducts = (await localClient.query('SELECT * FROM products ORDER BY id;')).rows;
    const supaProducts = (await supabaseClient.query('SELECT name FROM products;')).rows;
    const supaProdNames = new Set(supaProducts.map(p => p.name.toLowerCase().trim()));

    console.log(`Trouvé ${localProducts.length} produits dans la base locale.`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const prod of localProducts) {
      const prodNameKey = (prod.name || '').toLowerCase().trim();
      if (supaProdNames.has(prodNameKey)) {
        skippedCount++;
        continue;
      }

      // Trouver la catégorie correspondante sur Supabase
      const localCat = localCats.find(c => c.id === prod.category_id);
      const catKey = localCat ? localCat.name.toLowerCase().trim() : 'buffets';
      const targetCatId = supaCatMap.get(catKey) || 1;

      // Insertion du produit dans Supabase
      const insertProdQuery = `
        INSERT INTO products (
          name, description, dimensions, materials, color, price, 
          availability, type, is_featured, category_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()))
        RETURNING id;
      `;
      const prodRes = await supabaseClient.query(insertProdQuery, [
        prod.name,
        prod.description,
        prod.dimensions,
        prod.materials,
        prod.color,
        prod.price,
        prod.availability || 'Disponible',
        prod.type || 'PIECE_UNIQUE',
        prod.is_featured || false,
        targetCatId,
        prod.created_at
      ]);
      const newProdId = prodRes.rows[0].id;
      importedCount++;
      console.log(`  + Produit importé [${importedCount}] : "${prod.name}" (ID Supabase: ${newProdId})`);

      // Transférer les images associées à ce produit
      const localImages = (await localClient.query(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY id;',
        [prod.id]
      )).rows;

      for (const img of localImages) {
        await supabaseClient.query(`
          INSERT INTO product_images (product_id, image_url, is_primary, color_label)
          VALUES ($1, $2, $3, $4);
        `, [
          newProdId,
          img.image_url,
          img.is_primary || false,
          img.color_label || null
        ]);
      }
    }

    // 3. Réaligner les séquences PostgreSQL de Supabase
    await supabaseClient.query(`
      SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));
      SELECT setval('product_images_id_seq', COALESCE((SELECT MAX(id) FROM product_images), 1));
      SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
    `);

    console.log('\n====================================================');
    console.log('🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log(`✅ Produits importés sur Supabase : ${importedCount}`);
    console.log(`ℹ️ Produits déjà existants ignorés : ${skippedCount}`);
    console.log('====================================================');
    console.log('\n📌 RAPPEL IMPORTANT POUR LES PHOTOS :');
    console.log('Votre collègue doit envoyer son dossier "backend/uploads" via Git :');
    console.log('  git add backend/uploads');
    console.log('  git commit -m "Photos des nouveaux produits"');
    console.log('  git push origin main');
    console.log('\nEnsuite, faites un "git pull origin main" pour afficher les photos !');

  } catch (err) {
    console.error('❌ Erreur durant le transfert :', err);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

migrate();
