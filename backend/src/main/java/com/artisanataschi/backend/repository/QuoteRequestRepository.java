package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {
    List<QuoteRequest> findAllByOrderByCreatedDateDesc();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE QuoteRequest q SET q.product = null WHERE q.product.id = :productId")
    void nullifyProductByProductId(@org.springframework.data.repository.query.Param("productId") Long productId);
}
