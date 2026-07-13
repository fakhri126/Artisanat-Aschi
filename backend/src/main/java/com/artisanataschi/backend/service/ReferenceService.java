package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Reference;
import com.artisanataschi.backend.repository.ReferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReferenceService {

    @Autowired
    private ReferenceRepository referenceRepository;

    public List<Reference> getAllReferences() {
        return referenceRepository.findAll();
    }

    public Reference getReferenceById(Long id) {
        return referenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reference not found with id: " + id));
    }

    public Reference createReference(Reference reference) {
        return referenceRepository.save(reference);
    }

    public Reference updateReference(Long id, Reference refDetails) {
        Reference ref = getReferenceById(id);
        ref.setName(refDetails.getName());
        ref.setLogoUrl(refDetails.getLogoUrl());
        ref.setSiteUrl(refDetails.getSiteUrl());
        return referenceRepository.save(ref);
    }

    public void deleteReference(Long id) {
        Reference ref = getReferenceById(id);
        referenceRepository.delete(ref);
    }
}
