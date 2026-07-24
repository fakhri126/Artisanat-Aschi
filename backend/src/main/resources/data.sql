-- Seed new categories: 'Bijoux de Porte' and its subcategories
INSERT INTO categories (name, type, parent_id)
VALUES ('Bijoux de Porte', 'ACCESSOIRES', NULL)
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, type, parent_id)
VALUES ('Grands Ronds', 'BIJOUX_DE_PORTE', (SELECT id FROM categories WHERE name = 'Bijoux de Porte'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, type, parent_id)
VALUES ('Ovales', 'BIJOUX_DE_PORTE', (SELECT id FROM categories WHERE name = 'Bijoux de Porte'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, type, parent_id)
VALUES ('Petites Poignées', 'BIJOUX_DE_PORTE', (SELECT id FROM categories WHERE name = 'Bijoux de Porte'))
ON CONFLICT (name) DO NOTHING;

-- Seed products for handle line
-- 1. Bouton Riad Bleu
INSERT INTO products (name, description, dimensions, materials, color, price, availability, type, is_featured, category_id)
SELECT 'Bouton Riad Bleu',
       'Majolique traditionnelle peinte à la main, motifs d''arabesques bleu de cobalt et traits de terre d''ombre. Idéal pour les grands tiroirs, les grandes portes et les espaces peu chargés.',
       'Diamètre 6-7 cm', 'Céramique de majolique', 'Bleu cobalt', 28.00, 'Disponible', 'REPRODUCTIBLE', TRUE,
       (SELECT id FROM categories WHERE name = 'Grands Ronds')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bouton Riad Bleu');

-- 2. Bouton Soleil d'Or
INSERT INTO products (name, description, dimensions, materials, color, price, availability, type, is_featured, category_id)
SELECT 'Bouton Soleil d''Or',
       'Bouton ovale aux courbes généreuses, peint de rayons chauds ocre-jaune et lignes cobalt. Idéal pour les dressings, les bahuts, les éléments de cuisine.',
       '7 cm x 4 cm', 'Céramique de majolique', 'Ocre-jaune', 32.00, 'Disponible', 'REPRODUCTIBLE', TRUE,
       (SELECT id FROM categories WHERE name = 'Ovales')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bouton Soleil d''Or');

-- 3. Bouton Jasmin Sauvage
INSERT INTO products (name, description, dimensions, materials, color, price, availability, type, is_featured, category_id)
SELECT 'Bouton Jasmin Sauvage',
       'Miniature délicate peinte de rameaux d''olivier et fleurs de jasmin vert et bleu sur émail ivoire. Idéal pour les armoires, les éléments de cuisine, les tables de nuit.',
       'Diamètre 3-4 cm', 'Céramique de majolique', 'Ivoire, vert, bleu', 18.00, 'Disponible', 'REPRODUCTIBLE', TRUE,
       (SELECT id FROM categories WHERE name = 'Petites Poignées')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bouton Jasmin Sauvage');

-- Seed product images
INSERT INTO product_images (image_url, is_primary, product_id)
SELECT '/handle-knob.png', TRUE, (SELECT id FROM products WHERE name = 'Bouton Riad Bleu')
WHERE NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = (SELECT id FROM products WHERE name = 'Bouton Riad Bleu')
);

INSERT INTO product_images (image_url, is_primary, product_id)
SELECT '/handle-knob.png', TRUE, (SELECT id FROM products WHERE name = 'Bouton Soleil d''Or')
WHERE NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = (SELECT id FROM products WHERE name = 'Bouton Soleil d''Or')
);

INSERT INTO product_images (image_url, is_primary, product_id)
SELECT '/handle-knob.png', TRUE, (SELECT id FROM products WHERE name = 'Bouton Jasmin Sauvage')
WHERE NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = (SELECT id FROM products WHERE name = 'Bouton Jasmin Sauvage')
);
