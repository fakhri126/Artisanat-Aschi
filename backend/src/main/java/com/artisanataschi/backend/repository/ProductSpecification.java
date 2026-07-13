package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasCategory(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null || categoryName.isEmpty() || categoryName.equalsIgnoreCase("Tout")) {
                return null;
            }
            return cb.equal(root.get("category").get("name"), categoryName);
        };
    }

    public static Specification<Product> hasColor(String color) {
        return (root, query, cb) -> {
            if (color == null || color.isEmpty() || color.equalsIgnoreCase("Tout")) {
                return null;
            }
            return cb.equal(cb.lower(root.get("color")), color.toLowerCase());
        };
    }

    public static Specification<Product> hasDimensions(String dimensions) {
        return (root, query, cb) -> {
            if (dimensions == null || dimensions.isEmpty() || dimensions.equalsIgnoreCase("Tout")) {
                return null;
            }
            return cb.like(cb.lower(root.get("dimensions")), "%" + dimensions.toLowerCase() + "%");
        };
    }

    public static Specification<Product> hasType(String type) {
        return (root, query, cb) -> {
            if (type == null || type.isEmpty()) {
                return null;
            }
            return cb.equal(root.get("type"), type);
        };
    }
}
