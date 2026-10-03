package com.artisanataschi.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class ReelConfigRequestDto {

    @NotBlank(message = "L'URL de la vidéo est obligatoire")
    private String videoUrl;

    @Valid
    private List<ReelReviewRequestDto> reviews = new ArrayList<>();

    public ReelConfigRequestDto() {
    }

    public ReelConfigRequestDto(String videoUrl, List<ReelReviewRequestDto> reviews) {
        this.videoUrl = videoUrl;
        this.reviews = reviews != null ? reviews : new ArrayList<>();
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public List<ReelReviewRequestDto> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReelReviewRequestDto> reviews) {
        this.reviews = reviews;
    }
}
