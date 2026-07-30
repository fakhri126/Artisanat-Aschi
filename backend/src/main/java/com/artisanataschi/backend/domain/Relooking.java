package com.artisanataschi.backend.domain;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "relookings")
public class Relooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "image_avant_url", nullable = false)
    private String imageAvantUrl;

    @Column(name = "image_apres_url", nullable = false)
    private String imageApresUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdDate;

    public Relooking() {
    }

    public Relooking(Long id, String title, String description, String imageAvantUrl, String imageApresUrl, LocalDateTime createdDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageAvantUrl = imageAvantUrl;
        this.imageApresUrl = imageApresUrl;
        this.createdDate = createdDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageAvantUrl() {
        return imageAvantUrl;
    }

    public void setImageAvantUrl(String imageAvantUrl) {
        this.imageAvantUrl = imageAvantUrl;
    }

    public String getImageApresUrl() {
        return imageApresUrl;
    }

    public void setImageApresUrl(String imageApresUrl) {
        this.imageApresUrl = imageApresUrl;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}
