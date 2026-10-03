package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Relooking;
import com.artisanataschi.backend.repository.RelookingRepository;
import com.artisanataschi.backend.dto.RelookingRequestDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RelookingService {

    private final RelookingRepository relookingRepository;

    public RelookingService(RelookingRepository relookingRepository) {
        this.relookingRepository = relookingRepository;
    }

    public List<Relooking> getAllRelookings() {
        return relookingRepository.findAllByOrderByCreatedDateDesc();
    }

    @Transactional
    public Relooking createRelooking(RelookingRequestDto dto) {
        Relooking relooking = new Relooking();
        relooking.setTitle(dto.getTitle());
        relooking.setDescription(dto.getDescription());
        relooking.setCategory(dto.getCategory());
        relooking.setImageAvantUrl(dto.getImageAvantUrl());
        relooking.setImageApresUrl(dto.getImageApresUrl());
        relooking.setCreatedDate(LocalDateTime.now());
        return relookingRepository.save(relooking);
    }

    @Transactional
    public Relooking createRelooking(Relooking relooking) {
        return relookingRepository.save(relooking);
    }

    @Transactional
    public Relooking updateRelooking(Long id, RelookingRequestDto dto) {
        Relooking relooking = relookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relooking not found with id " + id));

        relooking.setTitle(dto.getTitle());
        relooking.setDescription(dto.getDescription());
        relooking.setCategory(dto.getCategory());
        relooking.setImageAvantUrl(dto.getImageAvantUrl());
        relooking.setImageApresUrl(dto.getImageApresUrl());

        return relookingRepository.save(relooking);
    }

    @Transactional
    public Relooking updateRelooking(Long id, Relooking relookingDetails) {
        Relooking relooking = relookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Relooking not found with id " + id));

        relooking.setTitle(relookingDetails.getTitle());
        relooking.setDescription(relookingDetails.getDescription());
        relooking.setCategory(relookingDetails.getCategory());
        relooking.setImageAvantUrl(relookingDetails.getImageAvantUrl());
        relooking.setImageApresUrl(relookingDetails.getImageApresUrl());

        return relookingRepository.save(relooking);
    }

    @Transactional
    public void deleteRelooking(Long id) {
        relookingRepository.findById(id).ifPresent(relookingRepository::delete);
    }
}
