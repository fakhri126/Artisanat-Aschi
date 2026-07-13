package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.domain.*;
import com.artisanataschi.backend.dto.DashboardStats;
import com.artisanataschi.backend.dto.ProductRequest;
import com.artisanataschi.backend.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

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

    // --- Statistics ---
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    // --- Categories CRUD ---
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // --- Products CRUD ---
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(productService.createProduct(productRequest));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(productService.updateProduct(id, productRequest));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // --- Projects CRUD ---
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@Valid @RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @Valid @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }

    // --- News CRUD ---
    @PostMapping("/news")
    public ResponseEntity<News> createNews(@Valid @RequestBody News news) {
        return ResponseEntity.ok(newsService.createNews(news));
    }

    @PutMapping("/news/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @Valid @RequestBody News news) {
        return ResponseEntity.ok(newsService.updateNews(id, news));
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok().build();
    }

    // --- References CRUD ---
    @PostMapping("/references")
    public ResponseEntity<Reference> createReference(@Valid @RequestBody Reference reference) {
        return ResponseEntity.ok(referenceService.createReference(reference));
    }

    @PutMapping("/references/{id}")
    public ResponseEntity<Reference> updateReference(@PathVariable Long id, @Valid @RequestBody Reference reference) {
        return ResponseEntity.ok(referenceService.updateReference(id, reference));
    }

    @DeleteMapping("/references/{id}")
    public ResponseEntity<Void> deleteReference(@PathVariable Long id) {
        referenceService.deleteReference(id);
        return ResponseEntity.ok().build();
    }

    // --- Testimonials CRUD ---
    @PostMapping("/testimonials")
    public ResponseEntity<Testimonial> createTestimonial(@Valid @RequestBody Testimonial testimonial) {
        return ResponseEntity.ok(testimonialService.createTestimonial(testimonial));
    }

    @PutMapping("/testimonials/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable Long id, @Valid @RequestBody Testimonial testimonial) {
        return ResponseEntity.ok(testimonialService.updateTestimonial(id, testimonial));
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long id) {
        testimonialService.deleteTestimonial(id);
        return ResponseEntity.ok().build();
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
        return ResponseEntity.ok().build();
    }
}
