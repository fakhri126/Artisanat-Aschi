const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString: SUPABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connecté à Supabase.');

  try {
    await client.query('BEGIN');

    // 1. Trouver tous les produits à supprimer :
    // - Catégorie 'Poignée Céramique' (les 32 boutons)
    // - Catégorie 'Grands Ronds' (les 2 déformés)
    // - Catégorie 'Ovales' (les 5 déformés)
    // - Catégorie 'Poignée Sculptée' (les 4 tirants linéaires)
    // - Produits contenant 'Bouton' ou des caractères déformés '»«»'
    const findQuery = `
      SELECT p.id, p.name, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.name IN ('Poignée Céramique', 'Grands Ronds', 'Ovales', 'Poignée Sculptée', 'Petites Poignées')
         OR p.name ILIKE 'Bouton %'
         OR p.name ILIKE '%»«»%'
         OR p.name ILIKE 'Tirant Linéaire%'
      ORDER BY p.id;
    `;
    const prodsToDelete = (await client.query(findQuery)).rows;
    console.log(`\nTrouvé ${prodsToDelete.length} produits à supprimer :`);
    prodsToDelete.forEach(p => console.log(`  - [ID: ${p.id}] "${p.name}" (Catégorie: ${p.category_name})`));

    if (prodsToDelete.length > 0) {
      const ids = prodsToDelete.map(p => p.id);

      // Supprimer les images associées dans product_images
      const delImages = await client.query(`DELETE FROM product_images WHERE product_id = ANY($1::int[]) RETURNING id;`, [ids]);
      console.log(`\nSupprimé ${delImages.rowCount} images associées dans product_images.`);

      // Mettre à null product_id dans quote_requests si des devis faisaient référence à ces produits
      await client.query(`UPDATE quote_requests SET product_id = NULL WHERE product_id = ANY($1::int[]);`, [ids]);

      // Supprimer les produits
      const delProds = await client.query(`DELETE FROM products WHERE id = ANY($1::int[]) RETURNING id;`, [ids]);
      console.log(`Supprimé ${delProds.rowCount} produits dans products.`);
    }

    // 2. Nettoyer les catégories vides associées à ces anciens bijoux si elles n'ont plus de produits
    const catsToClean = ['Poignée Céramique', 'Grands Ronds', 'Ovales', 'Poignée Sculptée', 'Petites Poignées'];
    for (const catName of catsToClean) {
      const catCheck = await client.query(`SELECT id FROM categories WHERE name = $1;`, [catName]);
      if (catCheck.rows.length > 0) {
        const catId = catCheck.rows[0].id;
        const countRes = await client.query(`SELECT COUNT(*) FROM products WHERE category_id = $1;`, [catId]);
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          await client.query(`DELETE FROM categories WHERE id = $1;`, [catId]);
          console.log(`Catégorie vide supprimée : "${catName}"`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Nettoyage terminé avec succès et validé !');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du nettoyage, rollback effectué :', err);
  } finally {
    await client.end();
  }
}

main();
