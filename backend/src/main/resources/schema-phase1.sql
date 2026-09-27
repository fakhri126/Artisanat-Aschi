-- ==============================================================================
-- Artisanat Aschi - Migration Phase 1 DDL
-- Tables: colors, reel_configs, reel_reviews
-- Idempotent script for PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Table colors
CREATE TABLE IF NOT EXISTS colors (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    hex VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_colors_is_default ON colors(is_default);

-- 2. Table reel_configs
CREATE TABLE IF NOT EXISTS reel_configs (
    id BIGSERIAL PRIMARY KEY,
    video_url VARCHAR(500) NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table reel_reviews
CREATE TABLE IF NOT EXISTS reel_reviews (
    id BIGSERIAL PRIMARY KEY,
    reel_config_id BIGINT NOT NULL,
    platform VARCHAR(50),
    name VARCHAR(150),
    avatar VARCHAR(50),
    rating INTEGER,
    text TEXT,
    time INTEGER,
    duration INTEGER,
    position VARCHAR(20),
    CONSTRAINT fk_reel_reviews_config 
        FOREIGN KEY (reel_config_id) 
        REFERENCES reel_configs(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reel_reviews_config_id ON reel_reviews(reel_config_id);
CREATE INDEX IF NOT EXISTS idx_reel_reviews_time ON reel_reviews(time);

-- 4. Initial Seed Data (Fallback if database is empty)
INSERT INTO colors (id, label, hex, is_default)
VALUES 
    ('bois-naturel', 'Bois Naturel', '#C4A482', true),
    ('noyer-fonce', 'Noyer Foncé', '#5C4033', true),
    ('chene-clair', 'Chêne Clair', '#D2B48C', true),
    ('acajou-dore', 'Acajou Doré', '#8B4513', true),
    ('ebene-sombre', 'Ébène Sombre', '#2B1B17', true),
    ('olivier-miel', 'Olivier Miel', '#808000', true),
    ('blanc-vieilli', 'Blanc Vieilli', '#F5F5DC', true),
    ('gris-flotte', 'Gris Flotté', '#708090', true)
ON CONFLICT (id) DO NOTHING;
