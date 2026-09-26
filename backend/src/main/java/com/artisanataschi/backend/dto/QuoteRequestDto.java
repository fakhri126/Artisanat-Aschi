package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class QuoteRequestDto {
    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String fullName;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[+0-9\\s()\\-]{6,25}$", message = "Format de numéro de téléphone invalide")
    private String phoneNumber;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 120, message = "L'email ne doit pas dépasser 120 caractères")
    private String email;

    private Long productId;

    @Size(max = 1000, message = "Les détails de personnalisation ne doivent pas dépasser 1000 caractères")
    private String personalizationDetails;

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 3000, message = "Le message ne doit pas dépasser 3000 caractères")
    private String message;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getPersonalizationDetails() { return personalizationDetails; }
    public void setPersonalizationDetails(String personalizationDetails) {
        this.personalizationDetails = personalizationDetails;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
