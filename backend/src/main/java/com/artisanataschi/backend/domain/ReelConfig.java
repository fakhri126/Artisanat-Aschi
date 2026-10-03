package com.artisanataschi.backend.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reel_configs")
public class ReelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String videoUrl;

    @OneToMany(mappedBy = "reelConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @OrderBy("time ASC")
    private List<ReelReview> reviews = new ArrayList<>();

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public ReelConfig() {
    }

    public ReelConfig(String videoUrl) {
        this.videoUrl = videoUrl;
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

    public List<ReelReview> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReelReview> reviews) {
        this.reviews = reviews;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
