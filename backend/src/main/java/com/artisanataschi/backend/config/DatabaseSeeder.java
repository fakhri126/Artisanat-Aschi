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

    private ProductImage img(Product p, String url, boolean primary) {
        ProductImage pi = new ProductImage();
        pi.setProduct(p);
        pi.setImageUrl(url);
        pi.setIsPrimary(primary);
        return pi;
    }

    private Product product(String name, String desc, String dims, String mats, String color,
                            String price, String avail, String type, boolean featured, Category category) {
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

        // ── 3. Seed Products ─────────────────────────────────────────────────
        if (productRepository.count() == 0) {
            Category buffets = categoryRepository.findByName("Buffets").orElse(null);
            Category tvUnits = categoryRepository.findByName("Meubles TV").orElse(null);
            Category mirrors = categoryRepository.findByName("Miroirs").orElse(null);
            Category doors   = categoryRepository.findByName("Portes").orElse(null);
            Category chests  = categoryRepository.findByName("Coffres").orElse(null);
            Category deco    = categoryRepository.findByName("Décoration").orElse(null);

            // PIÈCES UNIQUES
            Product p1 = product("Cabinet « Médina »",
                "Cabinet d'exception sculpté à la main, inspiré des palais beylicaux. Noyer massif avec ferrures en bronze ciselé.",
                "120 x 45 x 160 cm", "Noyer massif & Bronze", "Noyer", "6200", "Disponible", "PIECE_UNIQUE", true, buffets);
            productRepository.save(p1);
            p1.setImages(Collections.singletonList(img(p1, "/creation-unique.png", true)));

            Product p2 = product("Coffre « Kairouan »",
                "Coffre traditionnel en cèdre sculpté et clouté de laiton doré. Idéal comme table basse d'exception.",
                "90 x 50 x 55 cm", "Cèdre & Laiton", "Or et Brun", "2100", "Disponible", "PIECE_UNIQUE", true, chests);
            productRepository.save(p2);
            p2.setImages(Collections.singletonList(img(p2, "/cat-chest.png", true)));

            Product p3 = product("Porte d'apparat « Dar »",
                "Porte monumentale en chêne massif sculptée de motifs géométriques traditionnels et rosaces beylicales.",
                "220 x 140 cm", "Chêne & Fer forgé", "Brun foncé", null, "Disponible", "PIECE_UNIQUE", false, doors);
            productRepository.save(p3);
            p3.setImages(Collections.singletonList(img(p3, "/cat-door.png", true)));

            // REPRODUCTIBLES
            Product r1 = product("Miroir « Sidi Bou »",
                "Miroir élégant au cadre sculpté, rehaussé de touches dorées à la feuille d'or.",
                "80 x 120 cm", "Bois d'olivier & Feuille d'or", "Or", "1900", "Sur commande", "REPRODUCTIBLE", true, mirrors);
            productRepository.save(r1);
            r1.setImages(Collections.singletonList(img(r1, "/creation-model.png", true)));

            Product r2 = product("Buffet « Carthage »",
                "Buffet bas en noyer avec portes sculptées de motifs moucharabieh arabesques.",
                "180 x 50 x 85 cm", "Noyer", "Noyer naturel", "4200", "Sur commande", "REPRODUCTIBLE", true, buffets);
            productRepository.save(r2);
            r2.setImages(Collections.singletonList(img(r2, "/cat-buffet.png", true)));

            Product r3 = product("Meuble TV « Hammamet »",
                "Meuble TV alliant esthétique traditionnelle et fonctionnalités modernes.",
                "160 x 40 x 55 cm", "Bois de frêne", "Blanc Cérusé", "2600", "Sur commande", "REPRODUCTIBLE", false, tvUnits);
            productRepository.save(r3);
            r3.setImages(Collections.singletonList(img(r3, "/cat-tv.png", true)));

            // CATALOGUE
            Product c1 = product("Miroir Jasmin",
                "Miroir orné de fleurs sculptées à la main dans le bois de citronnier.",
                "70 x 70 cm", "Citronnier", "Naturel", null, "Sur commande", "CATALOGUE", false, mirrors);
            productRepository.save(c1);
            c1.setImages(Collections.singletonList(img(c1, "/creation-model.png", true)));

            Product c2 = product("Panneau Médina",
                "Panneau mural décoratif sculpté représentant des arabesques géométriques complexes.",
                "100 x 200 cm", "Chêne", "Bleu Sidi Bou", null, "Sur commande", "CATALOGUE", false, deco);
            productRepository.save(c2);
            c2.setImages(Collections.singletonList(img(c2, "/cat-deco.png", true)));

            productRepository.saveAll(Arrays.asList(p1, p2, p3, r1, r2, r3, c1, c2));
            System.out.println("✅ Products seeded.");
        }

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
