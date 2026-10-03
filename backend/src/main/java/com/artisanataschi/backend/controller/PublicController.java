package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.dto.QuoteRequestDto;
import com.artisanataschi.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/public")
public class PublicController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final ProjectService projectService;
    private final NewsService newsService;
    private final RelookingService relookingService;
    private final QuoteRequestService quoteRequestService;
    private final DeliveryService deliveryService;

    public PublicController(ProductService productService,
                            CategoryService categoryService,
                            ProjectService projectService,
                            NewsService newsService,
                            RelookingService relookingService,
                            QuoteRequestService quoteRequestService,
                            DeliveryService deliveryService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.projectService = projectService;
        this.newsService = newsService;
        this.relookingService = relookingService;
        this.quoteRequestService = quoteRequestService;
        this.deliveryService = deliveryService;
    }

    // --- Products ---
    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String dimensions,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        CacheControl cacheControl = CacheControl.maxAge(60, TimeUnit.SECONDS)
                .cachePublic()
                .sMaxAge(300, TimeUnit.SECONDS)
                .staleWhileRevalidate(600, TimeUnit.SECONDS);

        // 1. Mode avec pagination explicite (si page ou size est spécifié)
        if (page != null || size != null) {
            int pageIndex = (page != null) ? Math.max(0, page) : 0;
            int pageSize = (size != null) ? Math.min(Math.max(1, size), 100) : 24;
            Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "id"));
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(productService.getProductsFiltered(category, color, dimensions, type, pageable));
        }
        
        // 2. Mode sans pagination (compatibilité frontend existant) :
        // Plafond de sécurité augmenté à 250 éléments pour ne tronquer aucun des 159 produits actuels
        Pageable safeDefault = PageRequest.of(0, 250, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(productService.getProductsFiltered(category, color, dimensions, type, safeDefault).getContent());
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(120, TimeUnit.SECONDS).cachePublic().sMaxAge(600, TimeUnit.SECONDS).staleWhileRevalidate(1200, TimeUnit.SECONDS))
                .body(productService.getFeaturedProducts());
    }

    @GetMapping("/products/latest")
    public ResponseEntity<List<Product>> getLatestProducts() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(120, TimeUnit.SECONDS).cachePublic().sMaxAge(600, TimeUnit.SECONDS).staleWhileRevalidate(1200, TimeUnit.SECONDS))
                .body(productService.getLatestProducts());
    }

    @GetMapping("/products/type/{type}")
    public ResponseEntity<List<Product>> getProductsByType(@PathVariable String type) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic().sMaxAge(300, TimeUnit.SECONDS))
                .body(productService.getProductsByType(type));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(120, TimeUnit.SECONDS).cachePublic().sMaxAge(600, TimeUnit.SECONDS))
                    .body(productService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(300, TimeUnit.SECONDS).cachePublic().sMaxAge(3600, TimeUnit.SECONDS).staleWhileRevalidate(7200, TimeUnit.SECONDS))
                .body(categoryService.getAllCategories());
    }

    // --- Projects (Réalisations) ---
    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getProjects(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(projectService.getProjectsByCategory(category));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // --- News (Actualités) ---
    @GetMapping("/news")
    public ResponseEntity<List<News>> getNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/news/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.getNewsById(id));
    }

    // --- Submit Quote Request ---
    @PostMapping("/quotes")
    public ResponseEntity<QuoteRequest> submitQuoteRequest(@Valid @RequestBody QuoteRequestDto dto) {
        QuoteRequest request = quoteRequestService.createQuoteRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }

    // --- Relooking ---
    @GetMapping("/relookings")
    public ResponseEntity<List<Relooking>> getAllRelookings() {
        return ResponseEntity.ok(relookingService.getAllRelookings());
    }

    // --- Delivery ---
    @GetMapping("/deliveries")
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }
}
