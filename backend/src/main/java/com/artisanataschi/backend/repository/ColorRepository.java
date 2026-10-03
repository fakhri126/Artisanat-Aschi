package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColorRepository extends JpaRepository<Color, String> {
    List<Color> findAllByOrderByLabelAsc();
}
