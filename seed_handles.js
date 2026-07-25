const { Client } = require('pg');

async function seed() {
  const client = new Client({
    connectionString: 'postgresql://postgres:adminpassword@localhost:5432/artisanat_aschi'
  });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // 1. Get category IDs for "Bijoux de Porte" and its subcategories
    const resCat = await client.query(`
      SELECT id FROM categories 
      WHERE name IN ('Bijoux de Porte', 'Grands Ronds', 'Ovales', 'Petites Poignées')
    `);
    const categoryIds = resCat.rows.map(r => r.id);
    
    if (categoryIds.length > 0) {
      console.log('Found category IDs:', categoryIds);
      
      // 2. Delete existing products in those categories
      const resDelImg = await client.query(`
        DELETE FROM product_images 
        WHERE product_id IN (
          SELECT id FROM products WHERE category_id = ANY($1)
        )
      `, [categoryIds]);
      console.log('Deleted images:', resDelImg.rowCount);
      
      const resDelProd = await client.query(`
        DELETE FROM products WHERE category_id = ANY($1)
      `, [categoryIds]);
      console.log('Deleted products:', resDelProd.rowCount);
    }

    // Assign round robin categories
    const categories = ['Grands Ronds', 'Ovales', 'Petites Poignées'];
    
    // 3. Insert 25 new products
    for (let i = 1; i <= 25; i++) {
      const catName = categories[i % 3];
      const resCatId = await client.query(`SELECT id FROM categories WHERE name = $1`, [catName]);
      const catId = resCatId.rows[0].id;
      
      const name = `Bouton Majolique ${i}`;
      const desc = `Véritable bouton en céramique de majolique tunisienne, façonné et peint à la main. Pièce unique #${i}.`;
      const price = i % 2 === 0 ? 32.00 : 28.00;
      const dim = catName === 'Ovales' ? '7 cm x 4 cm' : (catName === 'Grands Ronds' ? 'Diamètre 6-7 cm' : 'Diamètre 3-4 cm');
      
      const resInsert = await client.query(`
        INSERT INTO products (name, description, dimensions, materials, color, price, availability, type, is_featured, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [name, desc, dim, 'Céramique de majolique', 'Multicolore', price, 'Disponible', 'REPRODUCTIBLE', true, catId]);
      
      const prodId = resInsert.rows[0].id;
      
      await client.query(`
        INSERT INTO product_images (image_url, is_primary, product_id)
        VALUES ($1, $2, $3)
      `, [`/poignees/new_knob_${i}.jpg`, true, prodId]);
    }
    
    console.log('Successfully inserted 25 new handles!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

seed();
