package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {
    List<QuoteRequest> findAllByOrderByCreatedDateDesc();
}
