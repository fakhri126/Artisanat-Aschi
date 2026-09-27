package com.artisanataschi.backend;

import com.artisanataschi.backend.config.CacheConfig;
import com.artisanataschi.backend.domain.Category;
import com.artisanataschi.backend.domain.Product;
import com.artisanataschi.backend.dto.ProductRequest;
import com.artisanataschi.backend.repository.CategoryRepository;
import com.artisanataschi.backend.repository.ProductRepository;
import com.artisanataschi.backend.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = CacheBehaviorTest.TestConfig.class)
public class CacheBehaviorTest {

    @Configuration
    @EnableCaching
    @Import(CacheConfig.class)
    static class TestConfig {
        @Bean
        public ProductRepository productRepository() {
            return Mockito.mock(ProductRepository.class);
        }

        @Bean
        public CategoryRepository categoryRepository() {
            return Mockito.mock(CategoryRepository.class);
        }

        @Bean
        public ProductService productService() {
            return new ProductService();
        }
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void resetMocksAndCache() {
        Mockito.reset(productRepository, categoryRepository);
        // Clear all caches
        for (String name : cacheManager.getCacheNames()) {
            cacheManager.getCache(name).clear();
        }
    }

    @Test
    @DisplayName("Vérifie CACHE MISS -> DB -> CACHE PUT puis CACHE HIT sans nouvel appel DB (featuredProducts)")
    void testFeaturedProductsCacheHitAndMiss() {
        Product p = new Product();
        p.setId(10L);
        p.setName("Buffet Royal");
        p.setIsFeatured(true);

        when(productRepository.findTop6ByIsFeaturedTrue()).thenReturn(List.of(p));

        // 1er appel : CACHE MISS -> appel DB attendu
        List<Product> firstCall = productService.getFeaturedProducts();
        assertEquals(1, firstCall.size());
        assertEquals("Buffet Royal", firstCall.get(0).getName());
        verify(productRepository, times(1)).findTop6ByIsFeaturedTrue();

        // 2ème appel identique : CACHE HIT -> AUCUN nouvel appel DB
        List<Product> secondCall = productService.getFeaturedProducts();
        assertEquals(1, secondCall.size());
        assertEquals("Buffet Royal", secondCall.get(0).getName());
        verify(productRepository, times(1)).findTop6ByIsFeaturedTrue(); // Toujours 1 seul appel !
    }

    @Test
    @DisplayName("Vérifie CACHE MISS -> CACHE HIT sur getProductsFiltered avec clés composites")
    void testProductsFilteredCacheKeyAndHit() {
        Product p = new Product();
        p.setId(20L);
        p.setName("Table Noyer");

        Page<Product> pageResult = new PageImpl<>(List.of(p), PageRequest.of(0, 24), 1);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pageResult);

        Pageable pageable = PageRequest.of(0, 24);

        // 1er appel : CACHE MISS
        Page<Product> res1 = productService.getProductsFiltered("Tables", "Noyer", null, "CATALOGUE", pageable);
        assertEquals(1, res1.getTotalElements());
        verify(productRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));

        // 2ème appel avec mêmes paramètres : CACHE HIT
        Page<Product> res2 = productService.getProductsFiltered("Tables", "Noyer", null, "CATALOGUE", pageable);
        assertEquals(1, res2.getTotalElements());
        verify(productRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));

        // 3ème appel avec paramètres différents (couleur "Blanc") : CACHE MISS (clé distincte)
        productService.getProductsFiltered("Tables", "Blanc", null, "CATALOGUE", pageable);
        verify(productRepository, times(2)).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Vérifie l'invalidation du cache (@CacheEvict allEntries=true) lors de la création d'un produit")
    void testCacheEvictionOnProductMutation() {
        Product p = new Product();
        p.setId(30L);
        p.setName("Miroir Ancien");
        p.setIsFeatured(true);

        when(productRepository.findTop6ByIsFeaturedTrue()).thenReturn(List.of(p));

        // Appel 1 : Popule le cache
        productService.getFeaturedProducts();
        verify(productRepository, times(1)).findTop6ByIsFeaturedTrue();

        // Appel 2 : Cache HIT
        productService.getFeaturedProducts();
        verify(productRepository, times(1)).findTop6ByIsFeaturedTrue();

        // Mutation ADMIN : Création d'un produit -> @CacheEvict déclenché
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Miroirs");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductRequest req = new ProductRequest();
        req.setName("Nouveau Miroir");
        req.setCategoryId(1L);
        req.setType("CATALOGUE");
        req.setPrice(new BigDecimal("950.00"));

        productService.createProduct(req);

        // Appel 3 après mutation : Le cache ayant été invalidé, un nouvel appel DB DOIT avoir lieu
        productService.getFeaturedProducts();
        verify(productRepository, times(2)).findTop6ByIsFeaturedTrue();
    }
}
