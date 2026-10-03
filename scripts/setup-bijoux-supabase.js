const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres.uerbqswgxsinayfyntsm:Aqwzsx%20126002@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function setupBijouxTable() {
  const client = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connecté à Supabase.');

    // 1. Créer la table bijoux_boards si elle n'existe pas
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS bijoux_boards (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        category VARCHAR(50) NOT NULL,
        sub_type VARCHAR(50) NOT NULL,
        size_category VARCHAR(50),
        image TEXT NOT NULL,
        dimensions VARCHAR(100),
        description TEXT,
        ideal_for TEXT,
        tags TEXT[],
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createTableQuery);
    console.log('✅ Table bijoux_boards créée ou déjà existante.');

    // 2. Vérifier s'il y a déjà des modèles
    const countRes = await client.query('SELECT COUNT(*) FROM bijoux_boards;');
    const currentCount = parseInt(countRes.rows[0].count, 10);
    console.log(`Nombre de modèles existants dans bijoux_boards : ${currentCount}`);

    // Si la table est vide, on l'initialise avec les modèles d'artisanat propres
    if (currentCount === 0) {
      console.log('Initialisation avec les modèles officiels...');

      const initialBoards = [
        // --- PORTES : POIGNÉES CÉRAMIQUE ---
        {
          id: 'porte-ceramique-verte-laiton',
          title: 'Poignée Céramique Ovale sur Plaque Laiton',
          subtitle: 'Émail peint main, cerclage bois noble & porte vert méditerranéen',
          category: 'portes',
          sub_type: 'ceramique',
          size_category: 'all',
          image: '/poignees/client_porte_verte_poignee_ceramique.jpg',
          dimensions: 'Médaillon 11 x 6 cm • Plaque 28 x 7 cm',
          description: 'Poignée horizontale ovale en faïence émaillée peinte à la main, sertie dans une bague en bois noble tournée et montée sur plaque de propreté galbée en laiton massif avec clé forgée.',
          ideal_for: 'Portes de maître voûtées, villas méditerranéennes, demeures d\'hôtes de caractère',
          tags: ['Céramique Peinte Main', 'Laiton Massif', 'Bague Bois', 'Finition Majolique'],
          display_order: 1
        },
        {
          id: 'porte-ceramique-rameaux-verts',
          title: 'Poignée Céramique Ovale à Motifs Rameaux',
          subtitle: 'Émail blanc à feuillages vert émeraude & plaque moucharabieh',
          category: 'portes',
          sub_type: 'ceramique',
          size_category: 'all',
          image: '/poignees/client_porte_verte_rameaux.png',
          dimensions: 'Médaillon 11 x 6 cm • Plaque 32 x 6.5 cm',
          description: 'Médaillon ovale en céramique à motifs botaniques vert émeraude sur fond blanc. Monté sur plaque moucharabieh ajourée en fer patiné avec serrure traditionnelle.',
          ideal_for: 'Portes d\'entrée et grandes portes doubles battants de caractère',
          tags: ['Feuillage d\'Olivier', 'Moucharabieh Ajouré', 'Fer Patiné', 'Fait Main'],
          display_order: 2
        },
        {
          id: 'porte-ceramique-bleue-sidibousaid',
          title: 'Poignée Céramique Ovale & Porte Bleue',
          subtitle: 'Faïence crème à motifs floraux & plaque bois sculptée',
          category: 'portes',
          sub_type: 'ceramique',
          size_category: 'all',
          image: '/poignees/client_porte_bleue_ceramique.jpg',
          dimensions: 'Médaillon 10 x 5.5 cm • Plaque 30 x 6 cm',
          description: 'Médaillon ovale en faïence artisanale serti de bois, posé sur une plaque de propreté verticale sculptée à claire-voie sur porte bleue traditionnelle incrustée de carreaux de faïence.',
          ideal_for: 'Portes d\'inspiration Sidi Bou Saïd, maisons de charme, résidences balnéaires',
          tags: ['Style Sidi Bou Saïd', 'Bois Noble Sculpté', 'Faïence Fine', 'Élégance Méditerranéenne'],
          display_order: 3
        },
        {
          id: 'porte-ceramique-majolique-bleue-ocre',
          title: 'Médaillon Ovale Majolique Bleue & Ocre',
          subtitle: 'Céramique andalouse sur moucharabieh bois cérusé',
          category: 'portes',
          sub_type: 'ceramique',
          size_category: 'all',
          image: '/poignees/client_poignee_ovale_majolique_bleue.jpg',
          dimensions: 'Médaillon 11 x 6 cm • Plaque 28 x 6 cm',
          description: 'Pièce maîtresse ovale en faïence aux émaux bleu cobalt et ocre jaune, sertie d\'olivier et présentée sur plaque ajourée sculptée en moucharabieh blanc cérusé.',
          ideal_for: 'Portes nobles d\'apparat, entrées d\'exception',
          tags: ['Majolique Bleue', 'Moucharabieh Cérusé', 'Bois d\'Olivier', 'Fait Main'],
          display_order: 4
        },

        // --- PORTES : POIGNÉES SCULPTÉES ---
        {
          id: 'porte-sculptee-bois-rosette',
          title: 'Poignée Sculptée à la Gouge & Rosace Losange',
          subtitle: 'Bois massif ciselé & plaque ajourée façon moucharabieh',
          category: 'portes',
          sub_type: 'sculptee',
          size_category: 'all',
          image: '/poignees/client_porte_sculptee_bois_rosette.jpg',
          dimensions: 'Poignée 14 cm • Rosace 18 x 12 cm • Plaque 26 x 5 cm',
          description: 'Ensemble sculpté main comprenant une poignée droite ciselée de losanges, une grande rosace murale en bas-relief géométrique et une plaque de serrure ajourée avec clé d\'époque.',
          ideal_for: 'Portes d\'entrée monumentales en bois massif, portes cloutées',
          tags: ['Noyer Massif', 'Sculpture Gouge', 'Rosace Losange', 'Artisanat d\'Art'],
          display_order: 5
        },
        {
          id: 'porte-sculptee-sauge-doree',
          title: 'Poignée Ciselée Dorée sur Porte Vert Sauge',
          subtitle: 'Bois sculpté patiné doré & plaque ajourée',
          category: 'portes',
          sub_type: 'sculptee',
          size_category: 'all',
          image: '/poignees/client_porte_sauge_poignee_doree.jpg',
          dimensions: 'Poignée 15 cm • Plaque 30 x 6 cm',
          description: 'Poignée ergonomique sculptée à reliefs géométriques avec finition patinée dorée, assortie à sa plaque de propreté ajourée sur porte moulurée vert pastel.',
          ideal_for: 'Portes d\'intérieur de maître, suites, salons d\'apparat',
          tags: ['Finition Dorée', 'Bois Ciselé', 'Vert Sauge', 'Ferronnerie d\'Art'],
          display_order: 6
        },
        {
          id: 'poignee-sculptee-celadon-doree',
          title: 'Poignée Sculptée Céladon & Plaque Dorée Ajourée',
          subtitle: 'Harmonie vert céladon & ferronnerie d\'art dorée',
          category: 'portes',
          sub_type: 'sculptee',
          size_category: 'all',
          image: '/poignees/client_poignee_sauge_plaque_doree.jpg',
          dimensions: 'Poignée 16 cm • Plaque 28 x 6.5 cm',
          description: 'Tirant sculpté en bois avec patine céladon douce, rehaussé d\'une plaque de propreté ajourée dorée à l\'or chaud.',
          ideal_for: 'Portes de chambres, salons bourgeois, ambiances méditerranéennes lumineuses',
          tags: ['Vert Céladon', 'Plaque Ajourée', 'Or Chaud', 'Fait Main'],
          display_order: 7
        },

        // --- PORTES : CACHES SERRURE & CELLULE ---
        {
          id: 'porte-cache-serrure',
          title: 'Cache-Serrure & Sonnette Moucharabieh Vert Émeraude',
          subtitle: 'Volet rabattable en bois noble sculpté main',
          category: 'portes',
          sub_type: 'cache_serrure',
          size_category: 'all',
          image: '/poignees/cache_serrure_vert.png',
          dimensions: '22 cm x 9 cm • Épaisseur 3.5 cm',
          description: 'Élégant coffrage en bois ajouré à motifs géométriques traditionnels, doté d\'une porte rabattable sur charnières invisibles pour dissimuler serrures de sécurité, visiophones ou boutons d\'interphone.',
          ideal_for: 'Portes d\'entrée sécurisées avec cylindres modernes à masquer',
          tags: ['Cache-Serrure', 'Moucharabieh', 'Vert Émeraude', 'Sur-mesure'],
          display_order: 8
        },
        {
          id: 'porte-cache-cellule',
          title: 'Cache-Cellule & Visiophone en Bois Massif Ciselé',
          subtitle: 'Coffrage ornemental pour domotique & serrures électroniques',
          category: 'portes',
          sub_type: 'cache_cellule',
          size_category: 'all',
          image: '/poignees/cache_cellule_bois.png',
          dimensions: '25 cm x 11 cm • Épaisseur 4 cm',
          description: 'Boîtier sculpté sur-mesure pour intégrer harmonieusement les technologies modernes (caméras, cellules, digicodes) sur des portes historiques ou d\'art.',
          ideal_for: 'Intégration domotique et serrures connectées sans dénaturer le style',
          tags: ['Domotique d\'Art', 'Cache Visiophone', 'Noyer Massif', 'Fait Main'],
          display_order: 9
        },

        // --- MEUBLES : PLANCHES MAÎTRESSES ---
        {
          id: 'planche-maitresse-formats',
          title: 'Planche de Référence des 3 Formats',
          subtitle: 'Grand (6-7 cm) • Ovale (7x4 cm) • Moyen (3-4 cm)',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'grand',
          image: '/bijoux-de-porte.jpg',
          dimensions: '3 formats standards d\'atelier',
          description: 'Vue d\'ensemble des pièces en céramique émaillée peintes à la main. Chaque bouton est serti d\'une embase en bois noble tournée et visserie intégrée.',
          ideal_for: 'Tous meubles : Cuisines, Dressings, Bahuts, Tables de nuit',
          tags: ['Céramique Majolique', '3 Formats', 'Multi-motifs', 'Finition Bois'],
          display_order: 10
        },
        {
          id: 'planche-meubles-grand',
          title: 'Boutons Grands Ronds (6 à 7 cm)',
          subtitle: 'Ligne Majolique Grand Format',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'grand',
          image: '/bijoux-de-porte.jpg',
          dimensions: 'Diamètre 6 à 7 cm',
          description: 'Boutons monumentaux pour meuble offrant une prise en main généreuse. Motifs andalous peints main à l\'émail brillant.',
          ideal_for: 'Grands tiroirs, bahuts massifs, portes de dressing, espaces peu chargés',
          tags: ['Grand Format 6-7cm', 'Prise ergonomique', 'Pièce maîtresse'],
          display_order: 11
        },
        {
          id: 'planche-meubles-moyen',
          title: 'Boutons Moyens Ronds (3 à 4 cm)',
          subtitle: 'Ligne Éléments de Cuisine & Commodes',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'moyen',
          image: '/bijoux-de-porte.jpg',
          dimensions: 'Diamètre 3 à 4 cm',
          description: 'Le format le plus polyvalent de notre atelier. Décliné en dizaines de motifs d\'arabesques, rameaux d\'olivier et géométries bleues, ocres et vertes.',
          ideal_for: 'Cuisines complètes, commodes, tables de nuit, meubles de salle de bain',
          tags: ['Format Polyvalent 3-4cm', 'Cuisines', 'Dressings'],
          display_order: 12
        },
        {
          id: 'planche-meubles-ovale',
          title: 'Poignées Cuvettes Ovales (7 x 4 cm)',
          subtitle: 'Ligne Ergonomique Profilée',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'ovale',
          image: '/uploads/ceramique_in_situ_cuvette_ovale.jpg',
          dimensions: '7 cm x 4 cm',
          description: 'Poignées de forme ovale avec encadrement bois sculpté en cuvette. Une prise en main douce et un rendu visuel d\'exception sur double porte.',
          ideal_for: 'Dressings contemporains, bahuts beylicaux, éléments de cuisine haute',
          tags: ['Format Ovale 7x4cm', 'Cuvette bois', 'Design Signature'],
          display_order: 13
        },
        {
          id: 'planche-meubles-sculptees',
          title: 'Collection Poignées Sculptées en Bois',
          subtitle: 'Planche des Mesures & Finitions',
          category: 'meubles',
          sub_type: 'sculptee',
          size_category: 'all',
          image: '/uploads/sculptee_collection_affiche.jpg',
          dimensions: '10 cm, 15 cm, 20 cm, 25 cm, 30 cm',
          description: 'Poignées longilignes façonnées en bois noble avec ciselures triangulaires. Disponibles en 4 teintes signature : Blanc cérusé, Bleu majolique, Vert sauge et Ocre safran.',
          ideal_for: 'Armoires, portes de dressing, grands tiroirs, meubles personnalisés',
          tags: ['Bois Sculpté', '5 Longueurs', '4 Teintes', 'Sur-mesure possible'],
          display_order: 14
        },
        {
          id: 'in-situ-cuisine',
          title: 'Mise en situation : Cuisine Complète d\'Art',
          subtitle: 'Harmonie de boutons ronds et ovales',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'moyen',
          image: '/uploads/ceramique_in_situ_cuisine_complete.jpg',
          dimensions: 'Mix formats 3-4 cm et 7x4 cm',
          description: 'Exemple d\'agencement sur façade vert sauge. Les boutons céramiques apportent une chaleur artisanale incomparable à une cuisine moderne ou classique.',
          ideal_for: 'Inspiration aménagement de cuisine sur-mesure',
          tags: ['Ambiance Cuisine', 'Vert Sauge', 'Mix & Match'],
          display_order: 15
        },
        {
          id: 'in-situ-buffet-vert',
          title: 'Mise en situation : Buffet & Poignées Sculptées',
          subtitle: 'Poignées ocre safran sur bois sculpté',
          category: 'meubles',
          sub_type: 'sculptee',
          size_category: 'all',
          image: '/uploads/sculptee_in_situ_buffet_vert.jpg',
          dimensions: 'Poignées 20 cm et 25 cm',
          description: 'Combinaison de poignées sculptées ocre safran et panneaux de céramique incrustés sur meuble d\'apparat.',
          ideal_for: 'Bahuts, buffets de salon, meubles d\'entrée',
          tags: ['Meuble d\'Apparat', 'Sculpture & Majolique', 'Finitions Royales'],
          display_order: 16
        },
        {
          id: 'details-fixation',
          title: 'Détails Techniques & Fixations',
          subtitle: 'Sertissage bois noble et vis métrique',
          category: 'meubles',
          sub_type: 'ceramique',
          size_category: 'moyen',
          image: '/uploads/ceramique_fixation_details.jpg',
          dimensions: 'Filetage standard M4 / M6 avec écrou',
          description: 'Chaque cabochon en faïence est scellé dans une bague en chêne ou noyer tournée à la main. Fixation universelle prête à poser sur tout panneau de 16 à 40 mm.',
          ideal_for: 'Montage facile et durable',
          tags: ['Fixation Universelle', 'Sertissage Bois', 'Haute Résistance'],
          display_order: 17
        }
      ];

      for (const b of initialBoards) {
        await client.query(`
          INSERT INTO bijoux_boards (
            id, title, subtitle, category, sub_type, size_category, image, dimensions, description, ideal_for, tags, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            category = EXCLUDED.category,
            sub_type = EXCLUDED.sub_type,
            size_category = EXCLUDED.size_category,
            image = EXCLUDED.image,
            dimensions = EXCLUDED.dimensions,
            description = EXCLUDED.description,
            ideal_for = EXCLUDED.ideal_for,
            tags = EXCLUDED.tags,
            display_order = EXCLUDED.display_order,
            updated_at = NOW();
        `, [
          b.id, b.title, b.subtitle, b.category, b.sub_type, b.size_category, b.image, b.dimensions, b.description, b.ideal_for, b.tags, b.display_order
        ]);
        console.log(`  + Modèle inséré : "${b.title}"`);
      }
      console.log(`✅ ${initialBoards.length} modèles insérés dans Supabase.`);
    }

    console.log('✅ Configuration Supabase terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur configuration Supabase :', err);
  } finally {
    await client.end();
  }
}

setupBijouxTable();
