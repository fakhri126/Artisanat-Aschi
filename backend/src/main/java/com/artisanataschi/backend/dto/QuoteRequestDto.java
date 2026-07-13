package com.artisanataschi.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class QuoteRequestDto {
    @NotBlank
    private String fullName;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    @Email
    private String email;

    private Long productId;

    private String personalizationDetails;

    @NotBlank
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
