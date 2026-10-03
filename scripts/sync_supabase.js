const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase.');

  const supaCats = (await client.query('SELECT id, name FROM categories ORDER BY id')).rows;
  console.log('Supabase categories count:', supaCats.length);

  const supaProds = (await client.query('SELECT id, name FROM products ORDER BY id')).rows;
  console.log('Supabase products count:', supaProds.length);

  const supaIds = new Set(supaProds.map(p => parseInt(p.id)));

  const sqlContent = fs.readFileSync(path.join(__dirname, '..', 'supabase_complete_setup.sql'), 'utf8');
  const prodLines = sqlContent.split('\n').filter(l => l.startsWith('INSERT INTO "products"'));

  const collisions = [];
  const sqlIdList = [];
  for (const l of prodLines) {
    const m = l.match(/VALUES \('(\d+)'/);
    if (m) {
      const id = parseInt(m[1]);
      sqlIdList.push(id);
      if (supaIds.has(id)) {
        collisions.push(id);
      }
    }
  }

  // 1. SYNC CATEGORIES
  const catLines = sqlContent.split('\n').filter(l => l.startsWith('INSERT INTO "categories"'));
  console.log('\n--- 1. CATEGORY SYNCHRONIZATION ---');
  const sqlCats = [];
  for (const l of catLines) {
    const m = l.match(/VALUES \('(\d+)', '([^']+)', '([^']+)', (NULL|'\d+')\)/);
    if (m) {
      sqlCats.push({
        id: parseInt(m[1]),
        name: m[2],
        type: m[3],
        parent_id: m[4] === 'NULL' ? null : parseInt(m[4].replace(/'/g, ''))
      });
    }
  }

  const supaCatByName = new Map();
  supaCats.forEach(c => supaCatByName.set(c.name.toLowerCase().trim(), parseInt(c.id)));
  const bijouxPorteId = supaCatByName.get('bijoux de porte') || 8;

  for (const c of sqlCats) {
    const key = c.name.toLowerCase().trim();
    if (!supaCatByName.has(key)) {
      const parentId = c.parent_id ? bijouxPorteId : null;
      const res = await client.query(
        'INSERT INTO categories (name, type, parent_id) VALUES ($1, $2, $3) RETURNING id',
        [c.name, c.type, parentId]
      );
      const newId = parseInt(res.rows[0].id);
      supaCatByName.set(key, newId);
      console.log(`  + Catégorie créée : "${c.name}" (ID Supabase: ${newId})`);
    }
  }

  const oldCatIdToSupaId = new Map();
  for (const c of sqlCats) {
    const key = c.name.toLowerCase().trim();
    const supaId = supaCatByName.get(key);
    if (supaId) {
      oldCatIdToSupaId.set(c.id, supaId);
    }
  }

  // 2. PARSE PRODUCT IMAGES
  const imgLines = sqlContent.split('\n').filter(l => l.startsWith('INSERT INTO "product_images"'));
  const imagesByOldProdId = new Map();
  for (const l of imgLines) {
    const m = l.match(/VALUES \('(\d+)', '([^']+)', (TRUE|FALSE), '(\d+)', (?:'([^']*)'|NULL)\)/);
    if (m) {
      const oldProdId = parseInt(m[4]);
      if (!imagesByOldProdId.has(oldProdId)) imagesByOldProdId.set(oldProdId, []);
      imagesByOldProdId.get(oldProdId).push({
        image_url: m[2],
        is_primary: m[3] === 'TRUE',
        color_label: m[5] || null
      });
    }
  }

  // 3. SYNC PRODUCTS
  console.log('\n--- 2. PRODUCT SYNCHRONIZATION ---');
  const currentProds = (await client.query('SELECT id, name FROM products')).rows;
  const currentProdNames = new Set(currentProds.map(p => p.name.toLowerCase().trim()));
  console.log(`Produits actuellement dans Supabase : ${currentProds.length}`);

  let insertedProds = 0;
  let skippedProds = 0;

  for (const l of prodLines) {
    const m = l.match(/VALUES \('(\d+)', (?:'([^']*)'|NULL), (?:'([^']*)'|NULL), (?:'((?:[^']|'')*)'|NULL), (?:'([^']*)'|NULL), (TRUE|FALSE), (?:'([^']*)'|NULL), '((?:[^']|'')*)', (?:'([^']*)'|NULL), '([^']+)', '(\d+)', (?:'([^']*)'|NULL)\)/);
    if (!m) {
      console.warn('Ligne ignorée (regex mismatch) :', l.substring(0, 70));
      continue;
    }

    const oldId = parseInt(m[1]);
    const availability = m[2] || 'Sur commande';
    const color = m[3] || null;
    const description = m[4] ? m[4].replace(/''/g, "'") : null;
    const dimensions = m[5] || null;
    const is_featured = m[6] === 'TRUE';
    const materials = m[7] || null;
    const name = m[8].replace(/''/g, "'");
    const price = m[9] ? parseFloat(m[9]) : null;
    const type = m[10];
    const oldCatId = parseInt(m[11]);
    const createdAt = m[12] || new Date().toISOString();

    const nameKey = name.toLowerCase().trim();
    if (currentProdNames.has(nameKey)) {
      skippedProds++;
      continue;
    }

    const targetCatId = oldCatIdToSupaId.get(oldCatId) || 1;

    const res = await client.query(`
      INSERT INTO products (
        name, description, dimensions, materials, color, price,
        availability, type, is_featured, category_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      name, description, dimensions, materials, color, price,
      availability, type, is_featured, targetCatId, createdAt
    ]);
    const newProdId = res.rows[0].id;
    currentProdNames.add(nameKey);
    insertedProds++;

    // Insert images
    const imgs = imagesByOldProdId.get(oldId) || [];
    for (const img of imgs) {
      await client.query(`
        INSERT INTO product_images (product_id, image_url, is_primary, color_label)
        VALUES ($1, $2, $3, $4)
      `, [newProdId, img.image_url, img.is_primary, img.color_label]);
    }
  }

  console.log(`✅ Produits insérés : ${insertedProds}`);
  console.log(`ℹ️ Produits déjà existants conservés : ${skippedProds}`);

  // 4. SYNC RELOOKINGS
  console.log('\n--- 3. RELOOKINGS SYNCHRONIZATION ---');
  const relookLines = sqlContent.split('\n').filter(l => l.startsWith('INSERT INTO "relookings"'));
  for (const l of relookLines) {
    try {
      await client.query(l);
    } catch (e) {}
  }
  const countRelook = (await client.query('SELECT count(*) FROM relookings')).rows[0].count;
  console.log(`Total Relookings dans Supabase : ${countRelook}`);

  // 5. FIX SEQUENCES
  console.log('\n--- 4. SÉQUENCES POSTGRES ---');
  const tables = ['products', 'product_images', 'categories', 'deliveries', 'news', 'projects', 'quote_requests', 'references_collab', 'relookings', 'testimonials'];
  for (const t of tables) {
    try {
      await client.query(`SELECT setval('${t}_id_seq', COALESCE((SELECT MAX(id) FROM "${t}"), 1))`);
    } catch (e) {}
  }
  console.log('✅ Séquences réalignées.');

  // FINAL STATS
  const totalProds = (await client.query('SELECT count(*) FROM products')).rows[0].count;
  const totalImgs = (await client.query('SELECT count(*) FROM product_images')).rows[0].count;
  const totalCats = (await client.query('SELECT count(*) FROM categories')).rows[0].count;

  console.log('\n====================================================');
  console.log('🎉 RÉSULTAT FINAL DANS SUPABASE :');
  console.log(`📦 Produits : ${totalProds}`);
  console.log(`🖼️ Images   : ${totalImgs}`);
  console.log(`📂 Catégories : ${totalCats}`);
  console.log('====================================================');

  await client.end();
}

main().catch(console.error);
