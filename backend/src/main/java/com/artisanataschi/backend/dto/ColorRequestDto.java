package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ColorRequestDto {

    @Size(max = 50, message = "L'ID ne doit pas dépasser 50 caractères")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "L'identifiant doit être un slug en minuscules (ex: blanc, bleu-ceruse)")
    private String id;

    @NotBlank(message = "Le libellé de la couleur est obligatoire")
    @Size(min = 1, max = 100, message = "Le libellé doit comporter entre 1 et 100 caractères")
    private String label;

    @NotBlank(message = "Le code hexadécimal est obligatoire")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Format de code hexadécimal invalide (ex: #FFFFFF ou #FFF)")
    private String hex;

    private Boolean isDefault = false;

    public ColorRequestDto() {
    }

    public ColorRequestDto(String id, String label, String hex, Boolean isDefault) {
        this.id = id;
        this.label = label;
        this.hex = hex;
        this.isDefault = isDefault != null ? isDefault : false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getHex() {
        return hex;
    }

    public void setHex(String hex) {
        this.hex = hex;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault != null ? isDefault : false;
    }
}
