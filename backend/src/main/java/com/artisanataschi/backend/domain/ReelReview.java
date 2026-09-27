package com.artisanataschi.backend.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "reel_reviews")
public class ReelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String platform;

    @Column(length = 150)
    private String name;

    @Column(length = 50)
    private String avatar;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String text;

    private Integer time;

    private Integer duration;

    @Column(length = 20)
    private String position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_config_id")
    @JsonBackReference
    private ReelConfig reelConfig;

    public ReelReview() {
    }

    public ReelReview(String platform, String name, String avatar, Integer rating, String text, Integer time, Integer duration, String position) {
        this.platform = platform;
        this.name = name;
        this.avatar = avatar;
        this.rating = rating;
        this.text = text;
        this.time = time;
        this.duration = duration;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getTime() {
        return time;
    }

    public void setTime(Integer time) {
        this.time = time;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public ReelConfig getReelConfig() {
        return reelConfig;
    }

    public void setReelConfig(ReelConfig reelConfig) {
        this.reelConfig = reelConfig;
    }
}
