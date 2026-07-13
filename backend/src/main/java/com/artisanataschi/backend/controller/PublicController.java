package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.dto.QuoteRequestDto;
import com.artisanataschi.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/public")
public class PublicController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private NewsService newsService;

    @Autowired
    private ReferenceService referenceService;

    @Autowired
    private TestimonialService testimonialService;

    @Autowired
    private QuoteRequestService quoteRequestService;

    // --- Products ---
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String dimensions,
            @RequestParam(required = false) String type) {
        List<Product> products = productService.getProductsFiltered(category, color, dimensions, type);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/products/type/{type}")
    public ResponseEntity<List<Product>> getProductsByType(@PathVariable String type) {
        return ResponseEntity.ok(productService.getProductsByType(type));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
        try {
            return ResponseEntity.ok(projectService.getProjectById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- News (Actualités) ---
    @GetMapping("/news")
    public ResponseEntity<List<News>> getNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/news/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(newsService.getNewsById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- References ---
    @GetMapping("/references")
    public ResponseEntity<List<Reference>> getReferences() {
        return ResponseEntity.ok(referenceService.getAllReferences());
    }

    // --- Testimonials ---
    @GetMapping("/testimonials")
    public ResponseEntity<List<Testimonial>> getTestimonials() {
        return ResponseEntity.ok(testimonialService.getAllTestimonials());
    }

    // --- Submit Quote Request ---
    @PostMapping("/quotes")
    public ResponseEntity<QuoteRequest> submitQuoteRequest(@Valid @RequestBody QuoteRequestDto dto) {
        QuoteRequest request = quoteRequestService.createQuoteRequest(dto);
        return ResponseEntity.ok(request);
    }
}
