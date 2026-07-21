-- Schema for artisanat_aschi database

-- Create categories table if it does not exist
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255) NOT NULL,
    parent_id BIGINT,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
);

-- Ensure parent_id column exists (in case table was created without it previously)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE categories ADD COLUMN parent_id BIGINT;
        ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id);
    END IF;
END $$;

-- Create products table if it does not exist
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dimensions VARCHAR(255),
    materials VARCHAR(255),
    color VARCHAR(255),
    price DECIMAL(19, 2),
    availability VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Create product_images table if it does not exist
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
