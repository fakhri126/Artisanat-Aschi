package com.artisanataschi.backend.config;

import com.artisanataschi.backend.domain.Admin;
import com.artisanataschi.backend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialisation de la base de données au démarrage.
 * Se charge uniquement de créer le compte administrateur initial si aucun compte n'existe.
 * Aucune fausse donnée ou donnée de test n'est insérée pour préserver l'intégrité de la production.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:admin}")
    private String defaultAdminUsername;

    @Value("${app.admin.default-password:adminpassword}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-email:admin@artisanat-aschi.com}")
    private String defaultAdminEmail;

    public DatabaseSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
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
    }
}
