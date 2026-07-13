package com.artisanataschi.backend.service;

import com.artisanataschi.backend.dto.DashboardStats;
import com.artisanataschi.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private QuoteRequestRepository quoteRequestRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private TestimonialRepository testimonialRepository;

    public DashboardStats getStats() {
        long totalProducts = productRepository.count();
        long totalProjects = projectRepository.count();
        long totalNews = newsRepository.count();
        long totalTestimonials = testimonialRepository.count();

        long totalQuotes = quoteRequestRepository.count();
        long pendingQuotes = quoteRequestRepository.findAll().stream()
                .filter(q -> "PENDING".equalsIgnoreCase(q.getStatus()))
                .count();

        return new DashboardStats(totalProducts, totalProjects, totalQuotes, pendingQuotes, totalNews, totalTestimonials);
    }
}
