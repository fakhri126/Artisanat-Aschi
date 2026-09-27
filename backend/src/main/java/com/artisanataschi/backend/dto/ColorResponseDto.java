package com.artisanataschi.backend.dto;

import com.artisanataschi.backend.domain.Color;

public class ColorResponseDto {

    private String id;
    private String label;
    private String hex;
    private Boolean isDefault;

    public ColorResponseDto() {
    }

    public ColorResponseDto(String id, String label, String hex, Boolean isDefault) {
        this.id = id;
        this.label = label;
        this.hex = hex;
        this.isDefault = isDefault;
    }

    public static ColorResponseDto fromEntity(Color color) {
        if (color == null) return null;
        return new ColorResponseDto(
                color.getId(),
                color.getLabel(),
                color.getHex(),
                color.getIsDefault()
        );
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
        this.isDefault = isDefault;
    }
}
