package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DeliveryRequestDto {
    @NotBlank(message = "Le titre de la livraison est obligatoire")
    @Size(max = 255, message = "Le titre ne doit pas depasser 255 caracteres")
    private String title;

    private String description;
    private String imageUrl;
    private String location;
    private String clientReview;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getClientReview() { return clientReview; }
    public void setClientReview(String clientReview) { this.clientReview = clientReview; }
}
