package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Reference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceRepository extends JpaRepository<Reference, Long> {
}
