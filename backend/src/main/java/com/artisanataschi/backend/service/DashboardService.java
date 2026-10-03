package com.artisanataschi.backend.service;

import com.artisanataschi.backend.dto.DashboardStats;
import com.artisanataschi.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final ProjectRepository projectRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final NewsRepository newsRepository;

    public DashboardService(ProductRepository productRepository,
                            ProjectRepository projectRepository,
                            QuoteRequestRepository quoteRequestRepository,
                            NewsRepository newsRepository) {
        this.productRepository = productRepository;
        this.projectRepository = projectRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.newsRepository = newsRepository;
    }

    public DashboardStats getStats() {
        long totalProducts = productRepository.count();
        long totalProjects = projectRepository.count();
        long totalNews = newsRepository.count();
        long totalQuotes = quoteRequestRepository.count();
        long pendingQuotes = quoteRequestRepository.countByStatusIgnoreCase("PENDING");

        return new DashboardStats(totalProducts, totalProjects, totalQuotes, pendingQuotes, totalNews, 0L);
    }
}
