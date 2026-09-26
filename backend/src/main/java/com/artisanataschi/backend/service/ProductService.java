package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Category;
import com.artisanataschi.backend.domain.Product;
import com.artisanataschi.backend.domain.ProductImage;
import com.artisanataschi.backend.dto.ProductRequest;
import com.artisanataschi.backend.repository.CategoryRepository;
import com.artisanataschi.backend.repository.ProductRepository;
import com.artisanataschi.backend.repository.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public List<Product> getProductsFiltered(String category, String color, String dimensions, String type) {
        Specification<Product> spec = Specification.where(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.hasColor(color))
                .and(ProductSpecification.hasDimensions(dimensions))
                .and(ProductSpecification.hasType(type));
        return productRepository.findAll(spec);
    }

    public Page<Product> getProductsFiltered(String category, String color, String dimensions, String type, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.hasColor(color))
                .and(ProductSpecification.hasDimensions(dimensions))
                .and(ProductSpecification.hasType(type));
        return productRepository.findAll(spec, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Cacheable(value = "featuredProducts")
    public List<Product> getFeaturedProducts() {
        return productRepository.findTop6ByIsFeaturedTrue();
    }

    @Cacheable(value = "latestProducts")
    public List<Product> getLatestProducts() {
        // Optimized: Delegates sorting and LIMIT 5 directly to the PostgreSQL engine
        Specification<Product> spec = Specification.where(ProductSpecification.isAvailableWorkshopProduct());
        Pageable topFive = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"));
        return productRepository.findAll(spec, topFive).getContent();
    }

    public List<Product> getProductsByType(String type) {
        return productRepository.findByType(type);
    }

    public Page<Product> getProductsByType(String type, Pageable pageable) {
        return productRepository.findByType(type, pageable);
    }

    @Transactional
    @CacheEvict(value = {"featuredProducts", "latestProducts"}, allEntries = true)
    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setDimensions(request.getDimensions());
        product.setMaterials(request.getMaterials());
        product.setColor(request.getColor());
        product.setPrice(request.getPrice());
        product.setAvailability(request.getAvailability());
        product.setType(request.getType());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setCategory(category);

        List<ProductImage> images = buildImages(request, product);
        product.setImages(images);

        return productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = {"featuredProducts", "latestProducts"}, allEntries = true)
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setDimensions(request.getDimensions());
        product.setMaterials(request.getMaterials());
        product.setColor(request.getColor());
        product.setPrice(request.getPrice());
        product.setAvailability(request.getAvailability());
        product.setType(request.getType());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setCategory(category);

        product.getImages().clear();
        List<ProductImage> images = buildImages(request, product);
        product.getImages().addAll(images);

        return productRepository.save(product);
    }

    private List<ProductImage> buildImages(ProductRequest request, Product product) {
        List<ProductImage> images = new ArrayList<>();

        if (request.getImageVariants() != null && !request.getImageVariants().isEmpty()) {
            // New structured variants
            for (int i = 0; i < request.getImageVariants().size(); i++) {
                ProductRequest.ImageVariant variant = request.getImageVariants().get(i);
                ProductImage pi = new ProductImage();
                pi.setProduct(product);
                pi.setImageUrl(variant.getImageUrl());
                pi.setIsPrimary(i == 0);
                pi.setColorLabel(variant.getColorLabel());
                images.add(pi);
            }
        } else if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            // Legacy fallback
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage pi = new ProductImage();
                pi.setProduct(product);
                pi.setImageUrl(request.getImageUrls().get(i));
                pi.setIsPrimary(i == 0);
                pi.setColorLabel(null);
                images.add(pi);
            }
        }

        return images;
    }

    @CacheEvict(value = {"featuredProducts", "latestProducts"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
