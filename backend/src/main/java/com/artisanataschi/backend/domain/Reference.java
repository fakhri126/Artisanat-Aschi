package com.artisanataschi.backend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "references_collab")
public class Reference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String logoUrl;

    private String siteUrl;

    public Reference() {}

    public Reference(Long id, String name, String logoUrl, String siteUrl) {
        this.id = id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.siteUrl = siteUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getSiteUrl() { return siteUrl; }
    public void setSiteUrl(String siteUrl) { this.siteUrl = siteUrl; }
}
