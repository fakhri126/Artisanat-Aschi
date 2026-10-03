const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('1. Recherche des produits mentionnés par l\'utilisateur...');
  const prods = await client.query(`
    SELECT id, name, price, availability, type 
    FROM products 
    WHERE name ILIKE '%rth%' OR name ILIKE '%médina%' OR name ILIKE '%medina%';
  `);
  console.log('Produits trouvés :', prods.rows);

  console.log('\n2. Application de ON DELETE CASCADE et ON DELETE SET NULL...');
  // Fix product_images
  await client.query(`
    ALTER TABLE product_images DROP CONSTRAINT IF EXISTS fkqnq71xsohugpqwf3c9gxmsuy;
    ALTER TABLE product_images ADD CONSTRAINT fkqnq71xsohugpqwf3c9gxmsuy 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  `);
  console.log('✅ Contrainte product_images mise à jour avec ON DELETE CASCADE');

  // Fix quote_requests
  await client.query(`
    ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS fk8c2ucjvohqhkhghgjqtcwmisc;
    ALTER TABLE quote_requests ADD CONSTRAINT fk8c2ucjvohqhkhghgjqtcwmisc 
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  `);
  console.log('✅ Contrainte quote_requests mise à jour avec ON DELETE SET NULL');

  console.log('\n3. Suppression des produits cibles si trouvés...');
  for (const p of prods.rows) {
    await client.query('DELETE FROM products WHERE id = $1;', [p.id]);
    console.log(`🗑️ Produit supprimé définitivement de la base : ID ${p.id} ("${p.name}")`);
  }

  await client.end();
  console.log('\nTerminé avec succès !');
}

main().catch(console.error);
