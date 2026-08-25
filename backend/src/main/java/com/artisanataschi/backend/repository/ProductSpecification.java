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

    /**
     * Filters ONLY physical workshop creations (excluding CATALOGUE items and Bijoux de Porte / door handles).
     */
    public static Specification<Product> isAvailableWorkshopProduct() {
        return (root, query, cb) -> {
            var notCatalogue = cb.notEqual(root.get("type"), "CATALOGUE");
            var catNameLower = cb.lower(root.get("category").get("name"));
            var prodNameLower = cb.lower(root.get("name"));

            var notPoigneeCat = cb.not(cb.like(catNameLower, "%poignée%"));
            var notBoutonCat  = cb.not(cb.like(catNameLower, "%bouton%"));
            var notBijouCat   = cb.not(cb.like(catNameLower, "%bijou%"));
            var notRondsCat   = cb.not(cb.like(catNameLower, "%ronds%"));
            var notOvalesCat  = cb.not(cb.like(catNameLower, "%ovales%"));

            var notPoigneeProd = cb.not(cb.like(prodNameLower, "%poignée%"));
            var notBoutonProd  = cb.not(cb.like(prodNameLower, "%bouton%"));
            var notBijouProd   = cb.not(cb.like(prodNameLower, "%bijou%"));

            return cb.and(
                notCatalogue,
                notPoigneeCat, notBoutonCat, notBijouCat, notRondsCat, notOvalesCat,
                notPoigneeProd, notBoutonProd, notBijouProd
            );
        };
    }
}

