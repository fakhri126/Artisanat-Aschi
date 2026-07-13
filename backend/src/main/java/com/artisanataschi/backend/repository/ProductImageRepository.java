package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
