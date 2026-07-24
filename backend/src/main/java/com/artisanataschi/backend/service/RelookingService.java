package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Relooking;
import com.artisanataschi.backend.repository.RelookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RelookingService {

    @Autowired
    private RelookingRepository relookingRepository;

    public List<Relooking> getAllRelookings() {
        return relookingRepository.findAllByOrderByCreatedDateDesc();
    }

    public Relooking createRelooking(Relooking relooking) {
        return relookingRepository.save(relooking);
    }

    public Relooking updateRelooking(Long id, Relooking relookingDetails) {
        Relooking relooking = relookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relooking not found with id " + id));

        relooking.setTitle(relookingDetails.getTitle());
        relooking.setDescription(relookingDetails.getDescription());
        relooking.setImageAvantUrl(relookingDetails.getImageAvantUrl());
        relooking.setImageApresUrl(relookingDetails.getImageApresUrl());

        return relookingRepository.save(relooking);
    }

    public void deleteRelooking(Long id) {
        Relooking relooking = relookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relooking not found with id " + id));
        relookingRepository.delete(relooking);
    }
}
