package com.artisanataschi.backend.config;

import com.artisanataschi.backend.service.CategoryService;
import com.artisanataschi.backend.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheWarmupService {

    private static final Logger log = LoggerFactory.getLogger(CacheWarmupService.class);

    private final ProductService productService;
    private final CategoryService categoryService;

    public CacheWarmupService(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    /**
     * Pré-charge le cache dès le démarrage du serveur Render afin que le tout premier
     * visiteur reçoive les produits du catalogue instantanément (< 10ms).
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUpOnStartup() {
        log.info("🔥 Pré-chauffage initial du cache Catalogue & Produits...");
        refreshCatalogCaches();
    }

    /**
     * Maintient la connexion PostgreSQL (Supabase Pooler) active et rafraîchit le cache
     * toutes les 10 minutes en arrière-plan pour éviter toute expiration à froid.
     */
    @Scheduled(fixedRate = 600000, initialDelay = 600000)
    public void scheduledCacheRefresh() {
        log.debug("♻️ Rafraîchissement périodique du cache Catalogue en arrière-plan...");
        refreshCatalogCaches();
    }

    private void refreshCatalogCaches() {
        try {
            Pageable defaultPage = PageRequest.of(0, 250, Sort.by(Sort.Direction.DESC, "id"));
            productService.getProductsFiltered(null, null, null, "CATALOGUE", defaultPage);
            productService.getProductsFiltered(null, null, null, null, defaultPage);
            productService.getFeaturedProducts();
            productService.getLatestProducts();
            categoryService.getAllCategories();
            log.info("✅ Cache Catalogue & Catégories pré-chargé avec succès.");
        } catch (Exception e) {
            log.warn("⚠️ Impossible de pré-charger le cache au démarrage : {}", e.getMessage());
        }
    }
}
