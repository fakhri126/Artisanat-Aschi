package com.artisanataschi.backend.config;

import com.artisanataschi.backend.domain.Admin;
import com.artisanataschi.backend.domain.Color;
import com.artisanataschi.backend.domain.ReelConfig;
import com.artisanataschi.backend.domain.ReelReview;
import com.artisanataschi.backend.repository.AdminRepository;
import com.artisanataschi.backend.repository.ColorRepository;
import com.artisanataschi.backend.repository.ReelConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Initialisation de la base de données au démarrage.
 * Se charge de créer le compte administrateur initial si absent,
 * ainsi que les 8 teintes artisanales et la configuration des Reels vidéo.
 * Aucune fausse donnée ou donnée de test n'est insérée pour préserver l'intégrité de la production.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final ColorRepository colorRepository;
    private final ReelConfigRepository reelConfigRepository;

    @Value("${app.admin.default-username:admin}")
    private String defaultAdminUsername;

    @Value("${app.admin.default-password:adminpassword}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-email:admin@artisanat-aschi.com}")
    private String defaultAdminEmail;

    public DatabaseSeeder(AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder,
                          ColorRepository colorRepository,
                          ReelConfigRepository reelConfigRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.colorRepository = colorRepository;
        this.reelConfigRepository = reelConfigRepository;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername(defaultAdminUsername);
            admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
            admin.setEmail(defaultAdminEmail);
            admin.setRole("ROLE_ADMIN");
            adminRepository.save(admin);
            logger.info("✅ Compte administrateur initial créé : {}", defaultAdminUsername);
        }

        if (colorRepository.count() == 0) {
            colorRepository.saveAll(Arrays.asList(
                new Color("blanc", "Blanc", "#FFFFFF", true),
                new Color("noir", "Noir", "#1A1A1A", true),
                new Color("noyer", "Noyer", "#5C3317", true),
                new Color("bleu", "Bleu", "#2D5F8A", true),
                new Color("or", "Or", "#C9A84C", true),
                new Color("naturel", "Naturel", "#C4A882", true),
                new Color("vert-olivier", "Vert Olivier", "#4A5E3A", true),
                new Color("bordeaux", "Bordeaux", "#7B2D3E", true)
            ));
            logger.info("✅ Couleurs de base initialisées (8 teintes artisanales).");
        }

        if (reelConfigRepository.count() == 0) {
            ReelConfig reelConfig = new ReelConfig("/uploads/1787567246786-WhatsAppVideo2026-08-11at15.33.26.mp4");
            ReelReview r1 = new ReelReview("instagram", "Fakhri kaddour", "S", 5, "Un travail magnifique ! Les portes sculptées sont une véritable œuvre d'art. ⭐⭐⭐⭐⭐", 3, 4, "left");
            r1.setReelConfig(reelConfig);
            ReelReview r2 = new ReelReview("facebook", "Boutaba Ahmed", "K", 5, "❤️ 47 personnes aiment ça · « Atelier incroyable, résultat au-delà de mes attentes ! »", 9, 4, "right");
            r2.setReelConfig(reelConfig);
            ReelReview r3 = new ReelReview("google", "ZAMBALA", "F", 5, "Service professionnel, livraison à temps. Notre salon est transformé !", 16, 4, "left");
            r3.setReelConfig(reelConfig);

            reelConfig.getReviews().add(r1);
            reelConfig.getReviews().add(r2);
            reelConfig.getReviews().add(r3);

            reelConfigRepository.save(reelConfig);
            logger.info("✅ Configuration du Reel vidéo et avis initialisée.");
        }
    }
}
