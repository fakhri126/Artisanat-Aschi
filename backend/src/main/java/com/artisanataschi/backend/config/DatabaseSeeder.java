package com.artisanataschi.backend.config;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    @Autowired private DeliveryRepository deliveryRepository;
    @Autowired private RelookingRepository relookingRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.db.force-seed:false}")
    private boolean forceSeed;

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

        // Si la base est déjà initialisée (catégories présentes), NE PAS ré-insérer ni écraser les données !
        // Cela garantit que toute donnée supprimée reste définitivement supprimée,
        // et que toute nouvelle donnée ajoutée ou modifiée reste intacte en base.
        if (!forceSeed && categoryRepository.count() > 0) {
            System.out.println("ℹ️ Base de données déjà initialisée. Le seeder automatique n'écrase aucune donnée utilisateur.");
            return;
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

        // Ensure "Porte Bijoux" and "Lustres" categories are seeded
        Category porteBijoux = categoryRepository.findByName("Porte Bijoux").orElseGet(() -> {
            Category c = cat("Porte Bijoux", "CATALOGUE");
            return categoryRepository.save(c);
        });

        Category lustres = categoryRepository.findByName("Lustres").orElseGet(() -> {
            Category c = cat("Lustres", "CATALOGUE");
            return categoryRepository.save(c);
        });

        // ── 3. Seed Products ─────────────────────────────────────────────────
        // ── 3. Clean up legacy mock products if present ─────────────────────
        List<String> legacyMockNames = Arrays.asList(
            "Cabinet « Médina »", "Coffre « Kairouan »", "Porte d'apparat « Dar »",
            "Miroir « Sidi Bou »", "Buffet « Carthage »", "Meuble TV « Hammamet »",
            "Miroir Jasmin", "Panneau Médina"
        );
        List<Product> legacyMocks = productRepository.findAll().stream()
            .filter(p -> p.getName() != null && legacyMockNames.contains(p.getName().trim()))
            .toList();
        if (!legacyMocks.isEmpty()) {
            productRepository.deleteAll(legacyMocks);
            System.out.println("🧹 Cleaned up legacy mock furniture products.");
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

        // ── Note: Bijoux de porte et poignées d'art sont désormais gérés via Supabase bijoux_boards ──
        System.out.println("✅ Bijoux de porte catalog is managed via Supabase bijoux_boards.");

        // ── 4. Seed Projects ─────────────────────────────────────────────────
        // ── 4. Seed Projects ─────────────────────────────────────────────────
        if (projectRepository.count() == 0) {
            Project pr1 = new Project();
            pr1.setTitle("Villa Didon");
            pr1.setDescription("Restauration et fabrication de portes monumentales et plafonds sculptés d'une villa de maître à Carthage.");
            pr1.setCategory("villa"); pr1.setLocation("Carthage");
            pr1.setDetails("Mobilier en noyer massif, portes cloutées traditionnelles, miroirs monumentaux.");
            pr1.setImageUrl("/project-villa.png");
            pr1.setVideoUrl("http://localhost:8081/api/uploads/Video.mp4");

            Project pr2 = new Project();
            pr2.setTitle("Maison d'Hôtes Dar El Jeld");
            pr2.setDescription("Aménagement complet des suites d'exception de la célèbre maison d'hôtes dans la Médina de Tunis.");
            pr2.setCategory("hotel"); pr2.setLocation("Médina de Tunis");
            pr2.setDetails("Coffres sculptés, lits à baldaquin en bois d'olivier, consoles et miroirs d'inspiration andalouse.");
            pr2.setImageUrl("/project-hotel.png");
            pr2.setVideoUrl("http://localhost:8081/api/uploads/Video.mp4");

            Project pr3 = new Project();
            pr3.setTitle("Hôtel Royal Mansour");
            pr3.setDescription("Création de portes intérieures sculptées et de buffets beylicaux pour le hall de réception.");
            pr3.setCategory("hotel"); pr3.setLocation("Hammamet");
            pr3.setDetails("Sculpture sur noyer de première qualité, ornements de feuilles d'or.");
            pr3.setImageUrl("/project-restaurant.png");
            pr3.setVideoUrl("http://localhost:8081/api/uploads/test-video.mp4");

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

        // ── 8. Seed Deliveries ────────────────────────────────────────────────
        if (deliveryRepository.count() == 0) {
            Delivery d1 = new Delivery("Suite Parentale & Tête de Lit Sculptée — Villa Gammarth",
                "Installation complète d'une suite de prestige comprenant une tête de lit monumentale ciselée à la main aux motifs andalous, tables de chevet marquetées et console d'entrée en noyer noble.",
                "http://localhost:8081/api/uploads/1788412722399-villacarthage.mp4",
                LocalDate.now().minusDays(1));
            Delivery d2 = new Delivery("Salon d'Apparat & Boiserie Andalouse — Résidence Carthage",
                "Aménagement complet sur-mesure avec boiserie murale ciselée, portes intérieures à claustra traditionnel et finitions en laiton vieilli pour une demeure de maître.",
                "http://localhost:8081/api/uploads/1788370150280-villasoukra.mp4",
                LocalDate.now().minusDays(5));
            Delivery d3 = new Delivery("Porte d'Apparat Cloutée & Moucharabiehs — Demeure Sidi Bou Saïd",
                "Pose clé en main d'une porte monumentale en noyer massif avec clous forgés traditionnels et moucharabieh d'inspiration beylicale.",
                "/project-villa.png",
                LocalDate.now().minusDays(12));
            deliveryRepository.saveAll(Arrays.asList(d1, d2, d3));
            System.out.println("✅ Deliveries seeded.");
        }

        // ── 9. Seed Relookings ────────────────────────────────────────────────
        if (relookingRepository.count() == 0) {
            Relooking r1 = new Relooking();
            r1.setTitle("Commode de Style Louis XVI");
            r1.setDescription("Restauration complète d'une commode en placage de noyer desséchée. Décapage, comblement des fentes et vernissage traditionnel au tampon.");
            r1.setCategory("Meubles Anciens");
            r1.setImageAvantUrl("/relooking-before.jpg");
            r1.setImageApresUrl("/relooking-after.jpg");
            r1.setCreatedDate(LocalDateTime.now().minusDays(7));

            Relooking r2 = new Relooking();
            r2.setTitle("Cadre de Miroir Ottoman");
            r2.setDescription("Reconstitution des ornements sculptés endommagés sur un cadre en bois doré d'époque et dorure fine à la feuille d'or.");
            r2.setCategory("Miroirs & Cadres");
            r2.setImageAvantUrl("/mirror-before.jpg");
            r2.setImageApresUrl("/mirror-after.jpg");
            r2.setCreatedDate(LocalDateTime.now().minusDays(14));

            Relooking r3 = new Relooking();
            r3.setTitle("Porte d'Entrée de Demeure");
            r3.setDescription("Rénovation esthétique et protectrice d'une porte d'entrée en bois massif exposée aux intempéries.");
            r3.setCategory("Portes & Boiseries");
            r3.setImageAvantUrl("/door-before.jpg");
            r3.setImageApresUrl("/door-after.jpg");
            r3.setCreatedDate(LocalDateTime.now().minusDays(21));

            relookingRepository.saveAll(Arrays.asList(r1, r2, r3));
            System.out.println("✅ Relookings seeded.");
        }
    }
}
