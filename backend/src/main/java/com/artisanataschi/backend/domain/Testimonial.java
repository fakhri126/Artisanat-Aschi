package com.artisanataschi.backend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "testimonials")
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    private String clientRole;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String videoUrl;

    private String imageUrl;

    @Column(nullable = false)
    private String type; // "TEXT" or "VIDEO"

    public Testimonial() {}

    public Testimonial(Long id, String clientName, String clientRole, String content,
                       String videoUrl, String imageUrl, String type) {
        this.id = id;
        this.clientName = clientName;
        this.clientRole = clientRole;
        this.content = content;
        this.videoUrl = videoUrl;
        this.imageUrl = imageUrl;
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientRole() { return clientRole; }
    public void setClientRole(String clientRole) { this.clientRole = clientRole; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
