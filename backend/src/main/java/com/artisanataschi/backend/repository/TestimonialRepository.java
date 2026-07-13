package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByType(String type);
}
