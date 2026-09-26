package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RelookingRequestDto {
    @NotBlank(message = "Le titre du relooking est obligatoire")
    @Size(max = 255, message = "Le titre ne doit pas depasser 255 caracteres")
    private String title;

    private String description;

    @NotBlank(message = "L'image avant est obligatoire")
    private String imageAvantUrl;

    @NotBlank(message = "L'image apres est obligatoire")
    private String imageApresUrl;

    @Size(max = 100, message = "La categorie ne doit pas depasser 100 caracteres")
    private String category;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageAvantUrl() { return imageAvantUrl; }
    public void setImageAvantUrl(String imageAvantUrl) { this.imageAvantUrl = imageAvantUrl; }

    public String getImageApresUrl() { return imageApresUrl; }
    public void setImageApresUrl(String imageApresUrl) { this.imageApresUrl = imageApresUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
