package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.dto.DashboardStats;
import com.artisanataschi.backend.dto.ProductRequest;
import com.artisanataschi.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final DashboardService dashboardService;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final ProjectService projectService;
    private final NewsService newsService;
    private final QuoteRequestService quoteRequestService;
    private final RelookingService relookingService;
    private final DeliveryService deliveryService;
    private final FileStorageService fileStorageService;

    public AdminController(DashboardService dashboardService,
                           CategoryService categoryService,
                           ProductService productService,
                           ProjectService projectService,
                           NewsService newsService,
                           QuoteRequestService quoteRequestService,
                           RelookingService relookingService,
                           DeliveryService deliveryService,
                           FileStorageService fileStorageService) {
        this.dashboardService = dashboardService;
        this.categoryService = categoryService;
        this.productService = productService;
        this.projectService = projectService;
        this.newsService = newsService;
        this.quoteRequestService = quoteRequestService;
        this.relookingService = relookingService;
        this.deliveryService = deliveryService;
        this.fileStorageService = fileStorageService;
    }

    // --- Statistics ---
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    // --- Categories CRUD ---
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // --- Products CRUD ---
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productRequest));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(productService.updateProduct(id, productRequest));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- Relooking CRUD ---
    @PostMapping("/relookings")
    public ResponseEntity<Relooking> createRelooking(@Valid @RequestBody Relooking relooking) {
        return ResponseEntity.status(HttpStatus.CREATED).body(relookingService.createRelooking(relooking));
    }

    @PutMapping("/relookings/{id}")
    public ResponseEntity<Relooking> updateRelooking(@PathVariable Long id, @Valid @RequestBody Relooking relooking) {
        return ResponseEntity.ok(relookingService.updateRelooking(id, relooking));
    }

    @DeleteMapping("/relookings/{id}")
    public ResponseEntity<Void> deleteRelooking(@PathVariable Long id) {
        relookingService.deleteRelooking(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String fileUrl = fileStorageService.storeFile(file, request);
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de l'enregistrement de l'image: " + e.getMessage()));
        }
    }

    // --- Projects CRUD ---
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(project));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // --- News CRUD ---
    @PostMapping("/news")
    public ResponseEntity<News> createNews(@Valid @RequestBody News news) {
        return ResponseEntity.status(HttpStatus.CREATED).body(newsService.createNews(news));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @Valid @RequestBody News news) {
        return ResponseEntity.ok(newsService.updateNews(id, news));
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }

    // --- Delivery CRUD ---
    @PostMapping("/deliveries")
    public ResponseEntity<Delivery> createDelivery(@Valid @RequestBody Delivery delivery) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.saveDelivery(delivery));
    }

    @PutMapping("/deliveries/{id}")
    public ResponseEntity<Delivery> updateDelivery(@PathVariable Long id, @Valid @RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.updateDelivery(id, delivery));
    }

    @DeleteMapping("/deliveries/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }

    // --- Quote Requests View & Management ---
    @GetMapping("/quotes")
    public ResponseEntity<List<QuoteRequest>> getQuoteRequests() {
        return ResponseEntity.ok(quoteRequestService.getAllQuoteRequests());
    }

    @PatchMapping("/quotes/{id}/status")
    public ResponseEntity<QuoteRequest> updateQuoteStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(quoteRequestService.updateQuoteStatus(id, status));
    }

    @DeleteMapping("/quotes/{id}")
    public ResponseEntity<Void> deleteQuoteRequest(@PathVariable Long id) {
        quoteRequestService.deleteQuoteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
