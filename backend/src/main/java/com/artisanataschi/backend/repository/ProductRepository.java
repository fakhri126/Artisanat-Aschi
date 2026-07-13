package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByType(String type);
    List<Product> findByIsFeaturedTrue();
    List<Product> findTop6ByIsFeaturedTrue();
}
