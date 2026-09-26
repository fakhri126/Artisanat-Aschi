package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TestimonialRequestDto {
    @NotBlank(message = "Le nom du client est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas depasser 100 caracteres")
    private String clientName;

    @Size(max = 100, message = "Le role ne doit pas depasser 100 caracteres")
    private String clientRole;

    @NotBlank(message = "Le contenu du temoignage est obligatoire")
    @Size(max = 2000, message = "Le temoignage ne doit pas depasser 2000 caracteres")
    private String content;

    private String videoUrl;
    private String imageUrl;
    private String type; // TEXT or VIDEO

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
