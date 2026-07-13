package com.artisanataschi.backend.repository;

import com.artisanataschi.backend.domain.News;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findAllByOrderByCreatedDateDesc();
}
