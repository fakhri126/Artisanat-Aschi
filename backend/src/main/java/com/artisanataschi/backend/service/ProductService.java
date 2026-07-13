package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Category;
import com.artisanataschi.backend.domain.Product;
import com.artisanataschi.backend.domain.ProductImage;
import com.artisanataschi.backend.dto.ProductRequest;
import com.artisanataschi.backend.repository.CategoryRepository;
import com.artisanataschi.backend.repository.ProductRepository;
import com.artisanataschi.backend.repository.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
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

    public List<Product> getProductsFiltered(String category, String color, String dimensions, String type) {
        Specification<Product> spec = Specification.where(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.hasColor(color))
                .and(ProductSpecification.hasDimensions(dimensions))
                .and(ProductSpecification.hasType(type));
        return productRepository.findAll(spec);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findTop6ByIsFeaturedTrue();
    }

    public List<Product> getProductsByType(String type) {
        return productRepository.findByType(type);
    }

    @Transactional
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

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage pi = new ProductImage();
                pi.setProduct(product);
                pi.setImageUrl(request.getImageUrls().get(i));
                pi.setIsPrimary(i == 0);
                images.add(pi);
            }
            product.setImages(images);
        }

        return productRepository.save(product);
    }

    @Transactional
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
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage pi = new ProductImage();
                pi.setProduct(product);
                pi.setImageUrl(request.getImageUrls().get(i));
                pi.setIsPrimary(i == 0);
                product.getImages().add(pi);
            }
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
