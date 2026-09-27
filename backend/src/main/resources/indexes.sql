-- =========================================================================
-- Script d'indexation idempotent pour PostgreSQL (Artisanat Aschi)
-- Haute performance, élimination des Table Scans & Optimisation des requêtes
-- =========================================================================

-- Extension pg_trgm pour recherche textuelle ultra-rapide (fuzzy / ILIKE)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Index sur les Clés Étrangères (Jointures & Suppressions en cascade)
CREATE INDEX IF NOT EXISTS idx_products_category_id 
    ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
    ON product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id 
    ON categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_product_id 
    ON quote_requests(product_id);

-- 2. Index de Filtrage Catalogue & Vitrine (Composites Haute Sélectivité)
CREATE INDEX IF NOT EXISTS idx_products_type 
    ON products(type);

CREATE INDEX IF NOT EXISTS idx_products_featured 
    ON products(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_type_featured 
    ON products(type, is_featured);

CREATE INDEX IF NOT EXISTS idx_products_type_id_desc 
    ON products(type, id DESC);

CREATE INDEX IF NOT EXISTS idx_products_cat_type_avail 
    ON products(category_id, type, availability);

CREATE INDEX IF NOT EXISTS idx_products_color_dimensions 
    ON products(color, dimensions);

CREATE INDEX IF NOT EXISTS idx_products_price 
    ON products(price) WHERE price IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_created_at 
    ON products(created_at DESC);

-- 3. Index Trigramme GIN pour recherche textuelle instantanée sur Nom et Description
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
    ON products USING gin(name gin_trgm_ops);

-- 4. Index d'Administration & Suivi
CREATE INDEX IF NOT EXISTS idx_quote_requests_status 
    ON quote_requests(status);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_date 
    ON quote_requests(created_date DESC);

CREATE INDEX IF NOT EXISTS idx_news_created_date 
    ON news(created_date DESC);

CREATE INDEX IF NOT EXISTS idx_projects_category 
    ON projects(category);

CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date 
    ON deliveries(delivery_date DESC);
