package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Testimonial;
import com.artisanataschi.backend.repository.TestimonialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestimonialService {

    @Autowired
    private TestimonialRepository testimonialRepository;

    public List<Testimonial> getAllTestimonials() {
        return testimonialRepository.findAll();
    }

    public Testimonial getTestimonialById(Long id) {
        return testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Testimonial not found with id: " + id));
    }

    public Testimonial createTestimonial(Testimonial testimonial) {
        return testimonialRepository.save(testimonial);
    }

    public Testimonial updateTestimonial(Long id, Testimonial testDetails) {
        Testimonial test = getTestimonialById(id);
        test.setClientName(testDetails.getClientName());
        test.setClientRole(testDetails.getClientRole());
        test.setContent(testDetails.getContent());
        test.setVideoUrl(testDetails.getVideoUrl());
        test.setImageUrl(testDetails.getImageUrl());
        test.setType(testDetails.getType());
        return testimonialRepository.save(test);
    }

    public void deleteTestimonial(Long id) {
        Testimonial test = getTestimonialById(id);
        testimonialRepository.delete(test);
    }
}
