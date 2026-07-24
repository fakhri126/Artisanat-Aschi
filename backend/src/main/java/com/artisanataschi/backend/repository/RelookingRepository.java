package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Relooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelookingRepository extends JpaRepository<Relooking, Long> {
    List<Relooking> findAllByOrderByCreatedDateDesc();
}
