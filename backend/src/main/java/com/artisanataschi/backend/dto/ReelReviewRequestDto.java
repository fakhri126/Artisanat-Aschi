package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReelReviewRequestDto {

    private Long id;

    @NotBlank(message = "La plateforme est obligatoire (ex: instagram, facebook, google)")
    @Size(max = 50)
    private String platform;

    @NotBlank(message = "Le nom de l'auteur est obligatoire")
    @Size(max = 150)
    private String name;

    @Size(max = 50)
    private String avatar;

    @Min(value = 1, message = "La note minimale est de 1")
    @Max(value = 5, message = "La note maximale est de 5")
    private Integer rating = 5;

    @NotBlank(message = "Le texte de l'avis est obligatoire")
    @Size(max = 2000)
    private String text;

    private Integer time = 0;
    private Integer duration = 4;

    @Size(max = 20)
    private String position = "left";

    public ReelReviewRequestDto() {
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
