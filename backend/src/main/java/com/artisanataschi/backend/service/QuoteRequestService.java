package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Product;
import com.artisanataschi.backend.domain.QuoteRequest;
import com.artisanataschi.backend.dto.QuoteRequestDto;
import com.artisanataschi.backend.repository.ProductRepository;
import com.artisanataschi.backend.repository.QuoteRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuoteRequestService {

    @Autowired
    private QuoteRequestRepository quoteRequestRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<QuoteRequest> getAllQuoteRequests() {
        return quoteRequestRepository.findAllByOrderByCreatedDateDesc();
    }

    public QuoteRequest getQuoteRequestById(Long id) {
        return quoteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quote request not found with id: " + id));
    }

    public QuoteRequest createQuoteRequest(QuoteRequestDto dto) {
        Product product = null;
        if (dto.getProductId() != null) {
            product = productRepository.findById(dto.getProductId()).orElse(null);
        }

        QuoteRequest request = new QuoteRequest();
        request.setFullName(dto.getFullName());
        request.setPhoneNumber(dto.getPhoneNumber());
        request.setEmail(dto.getEmail());
        request.setProduct(product);
        request.setPersonalizationDetails(dto.getPersonalizationDetails());
        request.setMessage(dto.getMessage());
        request.setCreatedDate(LocalDateTime.now());
        request.setStatus("PENDING");

        return quoteRequestRepository.save(request);
    }

    public QuoteRequest updateQuoteStatus(Long id, String status) {
        QuoteRequest request = getQuoteRequestById(id);
        request.setStatus(status); // PENDING, CONTACTED, COMPLETED
        return quoteRequestRepository.save(request);
    }

    public void deleteQuoteRequest(Long id) {
        QuoteRequest request = getQuoteRequestById(id);
        quoteRequestRepository.delete(request);
    }
}
