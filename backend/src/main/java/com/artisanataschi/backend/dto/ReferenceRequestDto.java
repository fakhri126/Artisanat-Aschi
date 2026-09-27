package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReferenceRequestDto {

    @NotBlank(message = "Le nom de la référence est obligatoire")
    @Size(max = 150, message = "Le nom ne doit pas dépasser 150 caractères")
    private String name;

    private String logoUrl;
    private String siteUrl;

    public ReferenceRequestDto() {
    }

    public ReferenceRequestDto(String name, String logoUrl, String siteUrl) {
        this.name = name;
        this.logoUrl = logoUrl;
        this.siteUrl = siteUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getSiteUrl() {
        return siteUrl;
    }

    public void setSiteUrl(String siteUrl) {
        this.siteUrl = siteUrl;
    }
}
