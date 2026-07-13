package com.artisanataschi.backend.dto;

public class DashboardStats {
    private long totalProducts;
    private long totalProjects;
    private long totalQuotes;
    private long pendingQuotes;
    private long totalNews;
    private long totalTestimonials;

    public DashboardStats() {}

    public DashboardStats(long totalProducts, long totalProjects, long totalQuotes,
                          long pendingQuotes, long totalNews, long totalTestimonials) {
        this.totalProducts = totalProducts;
        this.totalProjects = totalProjects;
        this.totalQuotes = totalQuotes;
        this.pendingQuotes = pendingQuotes;
        this.totalNews = totalNews;
        this.totalTestimonials = totalTestimonials;
    }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }

    public long getTotalQuotes() { return totalQuotes; }
    public void setTotalQuotes(long totalQuotes) { this.totalQuotes = totalQuotes; }

    public long getPendingQuotes() { return pendingQuotes; }
    public void setPendingQuotes(long pendingQuotes) { this.pendingQuotes = pendingQuotes; }

    public long getTotalNews() { return totalNews; }
    public void setTotalNews(long totalNews) { this.totalNews = totalNews; }

    public long getTotalTestimonials() { return totalTestimonials; }
    public void setTotalTestimonials(long totalTestimonials) { this.totalTestimonials = totalTestimonials; }
}
