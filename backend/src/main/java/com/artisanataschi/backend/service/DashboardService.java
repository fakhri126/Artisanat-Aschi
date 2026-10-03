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

    public DashboardStats getStats() {
        long totalProducts = productRepository.count();
        long totalProjects = projectRepository.count();
        long totalNews = newsRepository.count();
        long totalQuotes = quoteRequestRepository.count();
        long pendingQuotes = quoteRequestRepository.countByStatusIgnoreCase("PENDING");

        return new DashboardStats(totalProducts, totalProjects, totalQuotes, pendingQuotes, totalNews, 0L);
    }
}
