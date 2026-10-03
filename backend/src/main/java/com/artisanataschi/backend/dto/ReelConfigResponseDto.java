package com.artisanataschi.backend.dto;

import com.artisanataschi.backend.domain.ReelConfig;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ReelConfigResponseDto {

    private Long id;
    private String videoUrl;
    private List<ReelReviewResponseDto> reviews = new ArrayList<>();
    private LocalDateTime updatedAt;

    public ReelConfigResponseDto() {
    }

    public ReelConfigResponseDto(Long id, String videoUrl, List<ReelReviewResponseDto> reviews, LocalDateTime updatedAt) {
        this.id = id;
        this.videoUrl = videoUrl;
        this.reviews = reviews != null ? reviews : new ArrayList<>();
        this.updatedAt = updatedAt;
    }

    public static ReelConfigResponseDto fromEntity(ReelConfig config) {
        if (config == null) return null;
        List<ReelReviewResponseDto> reviewDtos = config.getReviews() != null
                ? config.getReviews().stream().map(ReelReviewResponseDto::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        return new ReelConfigResponseDto(
                config.getId(),
                config.getVideoUrl(),
                reviewDtos,
                config.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public List<ReelReviewResponseDto> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReelReviewResponseDto> reviews) {
        this.reviews = reviews;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
