package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.dto.QuoteRequestDto;
import com.artisanataschi.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(size, 100), Sort.by(Sort.Direction.DESC, "id"));
            return ResponseEntity.ok(productService.getProductsFiltered(category, color, dimensions, type, pageable));
        }
        List<Product> products = productService.getProductsFiltered(category, color, dimensions, type);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/products/latest")
    public ResponseEntity<List<Product>> getLatestProducts() {
        return ResponseEntity.ok(productService.getLatestProducts());
    }

    @GetMapping("/products/type/{type}")
    public ResponseEntity<List<Product>> getProductsByType(@PathVariable String type) {
        return ResponseEntity.ok(productService.getProductsByType(type));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
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
