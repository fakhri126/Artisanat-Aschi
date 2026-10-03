package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.Color;
import com.artisanataschi.backend.dto.ColorRequestDto;
import com.artisanataschi.backend.dto.ColorResponseDto;
import com.artisanataschi.backend.repository.ColorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ColorServiceTest {

    @Mock
    private ColorRepository colorRepository;

    @InjectMocks
    private ColorService colorService;

    private Color sampleColor;

    @BeforeEach
    void setUp() {
        sampleColor = new Color("noyer-fonce", "Noyer Foncé", "#5C4033", true);
    }

    @Test
    @DisplayName("Devrait retourner la liste de toutes les couleurs ordonnées")
    void testGetAllColors() {
        when(colorRepository.findAllByOrderByLabelAsc()).thenReturn(List.of(sampleColor));

        List<ColorResponseDto> result = colorService.getAllColors();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("noyer-fonce", result.get(0).getId());
        assertEquals("Noyer Foncé", result.get(0).getLabel());
        assertEquals("#5C4033", result.get(0).getHex());
        assertTrue(result.get(0).getIsDefault());
    }

    @Test
    @DisplayName("Devrait générer un slug automatique quand l'identifiant est omis")
    void testCreateColorWithAutoSlug() {
        ColorRequestDto request = new ColorRequestDto();
        request.setLabel("Chêne Précieux Doré");
        request.setHex("d2b48c"); // Minuscule sans #
        request.setIsDefault(false);

        when(colorRepository.existsById("chene-precieux-dore")).thenReturn(false);
        when(colorRepository.save(any(Color.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ColorResponseDto created = colorService.createColor(request);

        assertNotNull(created);
        assertEquals("chene-precieux-dore", created.getId());
        assertEquals("#D2B48C", created.getHex(), "Le hex doit être préfixé par # et converti en majuscules");
        assertEquals("Chêne Précieux Doré", created.getLabel());
        assertFalse(created.getIsDefault());
    }

    @Test
    @DisplayName("Devrait rejeter la création si l'identifiant existe déjà")
    void testCreateColorDuplicateIdThrows() {
        ColorRequestDto request = new ColorRequestDto();
        request.setId("noyer-fonce");
        request.setLabel("Noyer Foncé Bis");
        request.setHex("#5C4033");

        when(colorRepository.existsById("noyer-fonce")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> colorService.createColor(request));
        verify(colorRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait mettre à jour une couleur existante avec normalisation hexadécimale")
    void testUpdateColor() {
        ColorRequestDto updateDto = new ColorRequestDto();
        updateDto.setLabel("Noyer Très Foncé");
        updateDto.setHex("3a261a");
        updateDto.setIsDefault(true);

        when(colorRepository.findById("noyer-fonce")).thenReturn(Optional.of(sampleColor));
        when(colorRepository.save(any(Color.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ColorResponseDto updated = colorService.updateColor("noyer-fonce", updateDto);

        assertNotNull(updated);
        assertEquals("Noyer Très Foncé", updated.getLabel());
        assertEquals("#3A261A", updated.getHex());
        assertTrue(updated.getIsDefault());
    }

    @Test
    @DisplayName("Devrait supprimer une couleur existante")
    void testDeleteColor() {
        when(colorRepository.findById("noyer-fonce")).thenReturn(Optional.of(sampleColor));

        colorService.deleteColor("noyer-fonce");

        verify(colorRepository, times(1)).delete(sampleColor);
    }
}
