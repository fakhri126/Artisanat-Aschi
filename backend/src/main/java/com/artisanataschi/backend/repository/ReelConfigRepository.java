package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.ReelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReelConfigRepository extends JpaRepository<ReelConfig, Long> {
    Optional<ReelConfig> findFirstByOrderByIdAsc();
}
