package com.artisanataschi.backend.config;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired private AdminRepository adminRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private NewsRepository newsRepository;
    @Autowired private ReferenceRepository referenceRepository;
    @Autowired private TestimonialRepository testimonialRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Category cat(String name, String type) {
        Category c = new Category();
        c.setName(name);
        c.setType(type);
        return c;
    }

    private Category cat(String name, String type, Category parent) {
        Category c = new Category();
        c.setName(name);
        c.setType(type);
        c.setParentCategory(parent);
        return c;
    }

    private ProductImage img(Product p, String url, boolean primary) {
        ProductImage pi = new ProductImage();
        pi.setProduct(p);
        pi.setImageUrl(url);
        pi.setIsPrimary(primary);
        return pi;
    }

    private Product productWithImage(String name, String desc, String dims, String mats, String color,
                                     String price, String avail, String type, boolean featured, Category category, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setDimensions(dims);
        p.setMaterials(mats);
        p.setColor(color);
        p.setPrice(price != null ? new BigDecimal(price) : null);
        p.setAvailability(avail);
        p.setType(type);
        p.setIsFeatured(featured);
        p.setCategory(category);

        if (imageUrl != null && !imageUrl.isEmpty()) {
            ProductImage pi = new ProductImage();
            pi.setProduct(p);
            pi.setImageUrl(imageUrl);
            pi.setIsPrimary(true);
            p.getImages().add(pi);
        }

        return p;
    }

    @Override
    public void run(String... args) throws Exception {

        // ── 1. Seed Admin ────────────────────────────────────────────────────
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("adminpassword"));
            admin.setEmail("admin@artisanat-aschi.com");
            admin.setRole("ROLE_ADMIN");
            adminRepository.save(admin);
            System.out.println("✅ Default admin seeded: admin / adminpassword");
        }

        // ── 2. Seed Categories ───────────────────────────────────────────────
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(Arrays.asList(
                cat("Buffets",    "MOBILIER"),
                cat("Meubles TV", "MOBILIER"),
                cat("Miroirs",    "DECORATION"),
                cat("Portes",     "PORTES"),
                cat("Coffres",    "MOBILIER"),
                cat("Décoration", "DECORATION"),
                cat("Tables",     "MOBILIER")
            ));
            System.out.println("✅ Categories seeded.");
        }

        // Ensure "Bijoux de Porte" and its subcategories are seeded
        Category bijouxDePorte = categoryRepository.findByName("Bijoux de Porte").orElseGet(() -> {
            Category c = cat("Bijoux de Porte", "ACCESSOIRES");
            return categoryRepository.save(c);
        });

        Category catCeramique = categoryRepository.findByName("Poignée Céramique").orElseGet(() -> {
            Category c = cat("Poignée Céramique", "BIJOUX_DE_PORTE", bijouxDePorte);
            return categoryRepository.save(c);
        });

        Category catSculptee = categoryRepository.findByName("Poignée Sculptée").orElseGet(() -> {
            Category c = cat("Poignée Sculptée", "BIJOUX_DE_PORTE", bijouxDePorte);
            return categoryRepository.save(c);
        });

        Category catCuivre = categoryRepository.findByName("Poignée en Cuivre").orElseGet(() -> {
            Category c = cat("Poignée en Cuivre", "BIJOUX_DE_PORTE", bijouxDePorte);
            return categoryRepository.save(c);
        });

        // ── 3. Seed Products ─────────────────────────────────────────────────
        if (productRepository.count() == 0) {
            Category buffets = categoryRepository.findByName("Buffets").orElse(null);
            Category tvUnits = categoryRepository.findByName("Meubles TV").orElse(null);
            Category mirrors = categoryRepository.findByName("Miroirs").orElse(null);
            Category doors   = categoryRepository.findByName("Portes").orElse(null);
            Category chests  = categoryRepository.findByName("Coffres").orElse(null);
            Category deco    = categoryRepository.findByName("Décoration").orElse(null);

            // PIÈCES UNIQUES
            Product p1 = productWithImage("Cabinet « Médina »",
                "Cabinet d'exception sculpté à la main, inspiré des palais beylicaux. Noyer massif avec ferrures en bronze ciselé.",
                "120 x 45 x 160 cm", "Noyer massif & Bronze", "Noyer", "6200", "Disponible", "PIECE_UNIQUE", true, buffets, "/creation-unique.png");

            Product p2 = productWithImage("Coffre « Kairouan »",
                "Coffre traditionnel en cèdre sculpté et clouté de laiton doré. Idéal comme table basse d'exception.",
                "90 x 50 x 55 cm", "Cèdre & Laiton", "Or et Brun", "2100", "Disponible", "PIECE_UNIQUE", true, chests, "/cat-chest.png");

            Product p3 = productWithImage("Porte d'apparat « Dar »",
                "Porte monumentale en chêne massif sculptée de motifs géométriques traditionnels et rosaces beylicales.",
                "220 x 140 cm", "Chêne & Fer forgé", "Brun foncé", null, "Disponible", "PIECE_UNIQUE", false, doors, "/cat-door.png");

            // REPRODUCTIBLES
            Product r1 = productWithImage("Miroir « Sidi Bou »",
                "Miroir élégant au cadre sculpté, rehaussé de touches dorées à la feuille d'or.",
                "80 x 120 cm", "Bois d'olivier & Feuille d'or", "Or", "1900", "Sur commande", "REPRODUCTIBLE", true, mirrors, "/creation-model.png");

            Product r2 = productWithImage("Buffet « Carthage »",
                "Buffet bas en noyer avec portes sculptées de motifs moucharabieh arabesques.",
                "180 x 50 x 85 cm", "Noyer", "Noyer naturel", "4200", "Sur commande", "REPRODUCTIBLE", true, buffets, "/cat-buffet.png");

            Product r3 = productWithImage("Meuble TV « Hammamet »",
                "Meuble TV alliant esthétique traditionnelle et fonctionnalités modernes.",
                "160 x 40 x 55 cm", "Bois de frêne", "Blanc Cérusé", "2600", "Sur commande", "REPRODUCTIBLE", false, tvUnits, "/cat-tv.png");

            // CATALOGUE
            Product c1 = productWithImage("Miroir Jasmin",
                "Miroir orné de fleurs sculptées à la main dans le bois de citronnier.",
                "70 x 70 cm", "Citronnier", "Naturel", null, "Sur commande", "CATALOGUE", false, mirrors, "/creation-model.png");

            Product c2 = productWithImage("Panneau Médina",
                "Panneau mural décoratif sculpté représentant des arabesques géométriques complexes.",
                "100 x 200 cm", "Chêne", "Bleu Sidi Bou", null, "Sur commande", "CATALOGUE", false, deco, "/cat-deco.png");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, r1, r2, r3, c1, c2));
            System.out.println("✅ Furniture products seeded.");
        }

        // ── Clean up any legacy unwanted parquet knobs (with new_knob_ or old grandModels names) ──
        List<Product> legacyUnwanted = productRepository.findAll().stream()
            .filter(p -> {
                String name = p.getName() != null ? p.getName() : "";
                boolean hasOldImg = p.getImages() != null && p.getImages().stream().anyMatch(img -> img.getImageUrl() != null && img.getImageUrl().contains("new_knob_"));
                boolean hasOldName = name.startsWith("Grand Rond \"") || name.startsWith("Bouton Ovale \"") || name.startsWith("Petite Poignée \"Modèle Artisan");
                return hasOldImg || hasOldName;
            })
            .toList();
        if (!legacyUnwanted.isEmpty()) {
            productRepository.deleteAll(legacyUnwanted);
            System.out.println("🧹 Cleaned up " + legacyUnwanted.size() + " legacy unwanted handle items.");
        }

        // ── Seed the 32 authentic collection handles (with poignee_col... images) ──
        String[][] genuineHandles = {
            // COLONNE 1 (8 Poignées)
            {"Bouton Riad Vert & Ocre", "Faïence artisanale craquelée aux teintes d'olivier et d'ocre terre cuite, sertie dans son anneau de noyer massif.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert olive & Ocre", "34", "/poignees/poignee_col1_01.png"},
            {"Bouton Chevrons Bleu Cobalt", "Motifs géométriques en chevrons bleu de majolique d'époque et filets dorés sur faïence d'art.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu cobalt & Miel", "35", "/poignees/poignee_col1_02.png"},
            {"Bouton Rosace Feuille d'Émeraude", "Arabesque végétale florale peinte au pinceau fin avec émail brillant sur fond blanc soyeux.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert émeraude & Blanc ivoire", "36", "/poignees/poignee_col1_03.png"},
            {"Bouton Terre & Patine Antique", "Dégradé minéral naturel évoquant la poterie d'argile traditionnelle et les émaux cuits au feu de bois.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Terre cuite & Vert mousse", "32", "/poignees/poignee_col1_04.png"},
            {"Bouton Soleil Rayons Ocre", "Graphisme solaire linéaire aux reflets ambrés, idéal pour tiroirs de commodes et meubles d'appoint.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Ocre solaire & Terre de Sienne", "33", "/poignees/poignee_col1_05.png"},
            {"Bouton Majolique Émeraude Pure", "Émail vitrifié vert profond avec subtiles craquelures d'artisanat d'art et virole sculptée.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert émeraude profond", "36", "/poignees/poignee_col1_06.png"},
            {"Bouton Raphia & Gouttes Bleues", "Finitions bicolores rythmées par des ponctuations marines et des lignes bleu nuit.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu cobalt & Blanc moucheté", "34", "/poignees/poignee_col1_07.png"},
            {"Bouton Feuillage Printanier", "Motif végétal printanier aux couleurs chatoyantes, célébrant le renouveau et la nature méditerranéenne.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert prairie & Jaune safran", "35", "/poignees/poignee_col1_08.png"},

            // COLONNE 2 (8 Poignées)
            {"Bouton Spirale Mer Égée", "Vagues marines et volutes bleu outremer sur faïence vitrifiée aux reflets translucides.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu outremer & Blanc", "35", "/poignees/poignee_col2_01.png"},
            {"Bouton Tourbillon Cobalt & Ivoire", "Spirale calligraphique tracée à main levée, rehaussée d'une patine ivoirine et d'un cerclage en bois d'olivier.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Cobalt & Blanc cassé", "34", "/poignees/poignee_col2_02.png"},
            {"Bouton Tulipe Vert & Safran", "Pétale de tulipe stylisé en vert jade et fond blanc crème, bordé d'une finition ciselée à la gouge.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert jade & Blanc crème", "36", "/poignees/poignee_col2_03.png"},
            {"Bouton Diagonales Ocre & Nuit", "Lignes graphiques obliques mêlant l'ocre jaune chaud et des nuances de bleu nuit sur émail lisse.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Ocre jaune & Bleu nuit", "33", "/poignees/poignee_col2_04.png"},
            {"Bouton Cratère Cobalt Doré", "Céramique d'art aux émaux d'or et bleu cobalt intense, inspirée des céramiques de Kairouan et Nabeul.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu profond & Doré", "35", "/poignees/poignee_col2_05.png"},
            {"Bouton Trame Bleue d'Andalousie", "Résille et mosaïque peinte à la plume de roseau, évoquant l'héritage arabo-andalou des maîtres potiers.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu saphir & Céleste", "36", "/poignees/poignee_col2_06.png"},
            {"Bouton Éclosion Botanique", "Ponctuations florales vert mousse et boutons d'olivier sur faïence claire craquelée au naturel.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Vert mousse & Argile", "34", "/poignees/poignee_col2_07.png"},
            {"Bouton Duo Sphères Azur & Miel", "Double orbe coloré bleu ciel et jaune miel, création contemporaine ancrée dans la tradition artisanale.", "Petit", "Céramique émaillée peinte à la main & bague en bois noble", "Azur & Miel", "35", "/poignees/poignee_col2_08.png"},

            // COLONNE 3 (8 Poignées)
            {"Bouton Mosaïque Ocre & Azur", "Arcs et tesselles peints aux tons d'azur et d'ocre chaud, évoquant les pavements des palais tunisiens.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Ocre & Azur", "35", "/poignees/poignee_col3_01.png"},
            {"Bouton Cercles Solaires Cobalt", "Anneaux concentriques dorés et centre bleu roi sur émail vitrifié cuit à haute température.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Cobalt & Doré", "34", "/poignees/poignee_col3_02.png"},
            {"Bouton Grenade & Fleurs Pourpres", "Silhouette florale pourpre et ambre inspirée de la grenade et des jardins de Sidi Bou Saïd.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Pourpre & Ambre", "36", "/poignees/poignee_col3_03.png"},
            {"Bouton Marguerite d'Or & Bleu", "Rosace florale cobalt sur fond doré miel, alliance parfaite de noblesse et de fraîcheur artisanale.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu roi & Jaune miel", "36", "/poignees/poignee_col3_04.png"},
            {"Bouton Marbre Ocre & Nacre", "Dégradés marbrés ambrés aux nuances nacrées et reflets chauds, posés dans un cadre en noyer massif.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Ambre & Nacre", "33", "/poignees/poignee_col3_05.png"},
            {"Bouton Rosace Étoilée de Nabeul", "Étoile à 8 branches cobalt sur faïence blanche craquelée, emblème de la céramique d'art tunisienne.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Cobalt & Blanc pur", "36", "/poignees/poignee_col3_06.png"},
            {"Bouton Brindilles d'Olivier", "Rameaux d'olivier vert sauge et terre cuite, hommage à la terre d'oliviers et à l'artisanat du bois.", "Moyen", "Céramique émaillée peinte à la main & bague en bois noble", "Vert sauge & Terre cuite", "34", "/poignees/poignee_col3_07.png"},
            {"Bouton Arabesque Royale de Tunis", "Pièce d'apparat polychrome aux motifs arabo-andalous raffinés, digne des plus belles demeures.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu, Ocre & Terre", "38", "/poignees/poignee_col3_08.png"},

            // COLONNE 4 (8 Poignées)
            {"Bouton Vague Azur & Miel", "Onde organique bleu ciel et ocre jaune sur fond crème vitrifié, subtile harmonie marine.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Azur & Miel", "35", "/poignees/poignee_col4_01.png"},
            {"Bouton Treillis Géométrique Azur", "Motifs en treillis bleu azur et jaune miel inspirés des moucharabiehs et claustras orientaux.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu azur & Miel", "35", "/poignees/poignee_col4_02.png"},
            {"Bouton Couronne Rayons Ocre", "Rayures verticales rythmées surmontées d'un dégradé terre cuite et virole en bois tourné.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Ocre & Terre cuite", "33", "/poignees/poignee_col4_03.png"},
            {"Bouton Rosée Émeraude & Ambre", "Ponctuations vert émeraude et ambre chaleureux sur faïence blanche éclatante.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Émeraude & Ambre", "36", "/poignees/poignee_col4_04.png"},
            {"Bouton Arche Marine & Volute", "Vague stylisée bleu profond et spirale blanche d'inspiration océanique, finition haute brillance.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Bleu outremer & Blanc", "35", "/poignees/poignee_col4_05.png"},
            {"Bouton Rosace Perles Vertes", "Cercles perlés vert olive et accents d'argile naturelle, délicatesse du travail à la main.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Vert olive & Blanc perle", "34", "/poignees/poignee_col4_06.png"},
            {"Bouton Marbre Forêt Antique", "Émaux vert forêt profond aux reflets marbrés uniques, évoquant la richesse des marbres antiques.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Vert forêt & Patine", "36", "/poignees/poignee_col4_07.png"},
            {"Bouton Mosaïque Andalouse Cobalt", "Géométrie étoilée bleu cobalt et blanc pur sertie dans le bois, quintessence de l'artisanat tunisien.", "Grand", "Céramique émaillée peinte à la main & bague en bois noble", "Cobalt & Blanc pur", "36", "/poignees/poignee_col4_08.png"}
        };

        for (String[] h : genuineHandles) {
            String hName = h[0];
            String hDesc = h[1];
            String hDims = h[2];
            String hMat = h[3];
            String hColor = h[4];
            String hPrice = h[5];
            String hImg = h[6];

            if (!productRepository.findAll().stream().anyMatch(p -> p.getName().equals(hName))) {
                Product hp = productWithImage(
                    hName, hDesc, hDims, hMat, hColor, hPrice, "Disponible", "BIJOUX_DE_PORTE", true, catCeramique, hImg
                );
                productRepository.save(hp);
            }
        }
        System.out.println("✅ All 32 genuine handle products seeded.");

        // ── 4. Seed Projects ─────────────────────────────────────────────────
        if (projectRepository.count() == 0) {
            Project pr1 = new Project();
            pr1.setTitle("Villa Didon");
            pr1.setDescription("Restauration et fabrication de portes monumentales et plafonds sculptés d'une villa de maître à Carthage.");
            pr1.setCategory("Villas"); pr1.setLocation("Carthage");
            pr1.setDetails("Mobilier en noyer massif, portes cloutées traditionnelles, miroirs monumentaux.");
            pr1.setImageUrl("/project-1.jpg");

            Project pr2 = new Project();
            pr2.setTitle("Maison d'Hôtes Dar El Jeld");
            pr2.setDescription("Aménagement complet des suites d'exception de la célèbre maison d'hôtes dans la Médina de Tunis.");
            pr2.setCategory("Maisons d'hôtes"); pr2.setLocation("Médina de Tunis");
            pr2.setDetails("Coffres sculptés, lits à baldaquin en bois d'olivier, consoles et miroirs d'inspiration andalouse.");
            pr2.setImageUrl("/project-2.jpg");

            Project pr3 = new Project();
            pr3.setTitle("Hôtel Royal Mansour");
            pr3.setDescription("Création de portes intérieures sculptées et de buffets beylicaux pour le hall de réception.");
            pr3.setCategory("Hôtels"); pr3.setLocation("Hammamet");
            pr3.setDetails("Sculpture sur noyer de première qualité, ornements de feuilles d'or.");
            pr3.setImageUrl("/project-3.jpg");

            projectRepository.saveAll(Arrays.asList(pr1, pr2, pr3));
            System.out.println("✅ Projects seeded.");
        }

        // ── 5. Seed News ─────────────────────────────────────────────────────
        if (newsRepository.count() == 0) {
            News n1 = new News();
            n1.setTitle("Exposition Artisanale de Tunis 2026");
            n1.setContent("L'atelier Artisanat Aschi est fier d'annoncer sa participation au Salon National de l'Artisanat au Kram. Venez découvrir nos nouvelles pièces uniques et échanger avec nos maîtres artisans sculpteurs.");
            n1.setImageUrl("/news-exposition.jpg");
            n1.setCreatedDate(LocalDateTime.now().minusDays(5));

            News n2 = new News();
            n2.setTitle("Transmission de Savoir-Faire : Nos Jeunes Apprentis");
            n2.setContent("Depuis 1960, la transmission est au cœur de nos valeurs. Ce mois-ci, nous célébrons le parcours de nos deux nouveaux apprentis qui apprennent l'art ancestral de la sculpture sur noyer.");
            n2.setImageUrl("/news-apprentis.jpg");
            n2.setCreatedDate(LocalDateTime.now().minusDays(20));

            newsRepository.saveAll(Arrays.asList(n1, n2));
            System.out.println("✅ News seeded.");
        }

        // ── 6. Seed References ───────────────────────────────────────────────
        if (referenceRepository.count() == 0) {
            Reference rf1 = new Reference(); rf1.setName("Dar El Jeld");        rf1.setLogoUrl("/ref-dareljeld.png");  rf1.setSiteUrl("https://www.dareljeld.com");
            Reference rf2 = new Reference(); rf2.setName("La Badira");           rf2.setLogoUrl("/ref-labadira.png");   rf2.setSiteUrl("https://www.labadira.com");
            Reference rf3 = new Reference(); rf3.setName("Villa Didon");          rf3.setLogoUrl("/ref-villadidon.png"); rf3.setSiteUrl("https://www.villadidoncarthage.com");
            Reference rf4 = new Reference(); rf4.setName("Office National de l'Artisanat"); rf4.setLogoUrl("/ref-artisanat.png"); rf4.setSiteUrl("http://www.artisanat.nat.tn");
            referenceRepository.saveAll(Arrays.asList(rf1, rf2, rf3, rf4));
            System.out.println("✅ References seeded.");
        }

        // ── 7. Seed Testimonials ─────────────────────────────────────────────
        if (testimonialRepository.count() == 0) {
            Testimonial t1 = new Testimonial();
            t1.setClientName("Sonia Ben Miled");
            t1.setClientRole("Propriétaire de Villa, Sidi Bou Saïd");
            t1.setContent("L'atelier Aschi a transformé notre entrée avec une porte monumentale qui suscite l'admiration de tous nos visiteurs. Le travail du bois est d'une finesse incomparable.");
            t1.setType("TEXT"); t1.setImageUrl("/client-sonia.jpg");

            Testimonial t2 = new Testimonial();
            t2.setClientName("Mehdi Karoui");
            t2.setClientRole("Directeur Général, Maison d'Hôtes Dar Sidi");
            t2.setContent("Nous collaborons avec l'atelier Aschi depuis plusieurs années pour meubler nos suites. Leurs buffets et coffres apportent cette touche d'authenticité luxueuse qui ravit notre clientèle internationale.");
            t2.setType("TEXT"); t2.setImageUrl("/client-mehdi.jpg");

            testimonialRepository.saveAll(Arrays.asList(t1, t2));
            System.out.println("✅ Testimonials seeded.");
        }
    }
}
