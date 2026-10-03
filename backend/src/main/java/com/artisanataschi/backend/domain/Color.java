package com.artisanataschi.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "colors")
public class Color {

    @Id
    @Column(nullable = false, unique = true, length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false, length = 20)
    private String hex;

    @Column(nullable = false)
    private Boolean isDefault = false;

    public Color() {
    }

    public Color(String id, String label, String hex, Boolean isDefault) {
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
