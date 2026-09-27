package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Color;
import com.artisanataschi.backend.dto.ColorRequestDto;
import com.artisanataschi.backend.dto.ColorResponseDto;
import com.artisanataschi.backend.repository.ColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColorService {

    @Autowired
    private ColorRepository colorRepository;

    @Cacheable(value = "colors", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<ColorResponseDto> getAllColors() {
        return colorRepository.findAllByOrderByLabelAsc().stream()
                .map(ColorResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ColorResponseDto getColorById(String id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Couleur introuvable avec l'identifiant : " + id));
        return ColorResponseDto.fromEntity(color);
    }

    @CacheEvict(value = "colors", allEntries = true)
    @Transactional
    public ColorResponseDto createColor(ColorRequestDto dto) {
        String id = dto.getId();
        if (id == null || id.isBlank()) {
            id = generateSlug(dto.getLabel());
        } else {
            id = id.trim().toLowerCase();
        }

        if (colorRepository.existsById(id)) {
            throw new IllegalArgumentException("Une couleur existe déjà avec l'identifiant : " + id);
        }

        Color color = new Color(
                id,
                dto.getLabel().trim(),
                normalizeHex(dto.getHex()),
                dto.getIsDefault()
        );

        Color saved = colorRepository.save(color);
        return ColorResponseDto.fromEntity(saved);
    }

    @CacheEvict(value = "colors", allEntries = true)
    @Transactional
    public ColorResponseDto updateColor(String id, ColorRequestDto dto) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Couleur introuvable avec l'identifiant : " + id));

        color.setLabel(dto.getLabel().trim());
        color.setHex(normalizeHex(dto.getHex()));
        if (dto.getIsDefault() != null) {
            color.setIsDefault(dto.getIsDefault());
        }

        Color updated = colorRepository.save(color);
        return ColorResponseDto.fromEntity(updated);
    }

    @CacheEvict(value = "colors", allEntries = true)
    @Transactional
    public void deleteColor(String id) {
        Color color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Couleur introuvable avec l'identifiant : " + id));
        colorRepository.delete(color);
    }

    private String normalizeHex(String hex) {
        String trimmed = hex.trim().toUpperCase();
        return trimmed.startsWith("#") ? trimmed : "#" + trimmed;
    }

    private String generateSlug(String label) {
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
