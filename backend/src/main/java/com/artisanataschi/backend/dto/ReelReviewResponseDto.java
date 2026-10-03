package com.artisanataschi.backend.dto;

import com.artisanataschi.backend.domain.ReelReview;

public class ReelReviewResponseDto {

    private Long id;
    private String platform;
    private String name;
    private String avatar;
    private Integer rating;
    private String text;
    private Integer time;
    private Integer duration;
    private String position;

    public ReelReviewResponseDto() {
    }

    public ReelReviewResponseDto(Long id, String platform, String name, String avatar, Integer rating, String text, Integer time, Integer duration, String position) {
        this.id = id;
        this.platform = platform;
        this.name = name;
        this.avatar = avatar;
        this.rating = rating;
        this.text = text;
        this.time = time;
        this.duration = duration;
        this.position = position;
    }

    public static ReelReviewResponseDto fromEntity(ReelReview entity) {
        if (entity == null) return null;
        return new ReelReviewResponseDto(
                entity.getId(),
                entity.getPlatform(),
                entity.getName(),
                entity.getAvatar(),
                entity.getRating(),
                entity.getText(),
                entity.getTime(),
                entity.getDuration(),
                entity.getPosition()
        );
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
}
