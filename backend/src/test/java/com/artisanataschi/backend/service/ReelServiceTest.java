package com.artisanataschi.backend.service;

import com.artisanataschi.backend.domain.ReelConfig;
import com.artisanataschi.backend.domain.ReelReview;
import com.artisanataschi.backend.dto.ReelConfigRequestDto;
import com.artisanataschi.backend.dto.ReelConfigResponseDto;
import com.artisanataschi.backend.dto.ReelReviewRequestDto;
import com.artisanataschi.backend.repository.ReelConfigRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReelServiceTest {

    @Mock
    private ReelConfigRepository reelConfigRepository;

    @InjectMocks
    private ReelService reelService;

    @Test
    @DisplayName("Devrait retourner la configuration existante avec ses reviews ordonnées")
    void testGetReelConfigExisting() {
        ReelConfig config = new ReelConfig("/uploads/custom-reel.mp4");
        config.setId(1L);

        ReelReview review = new ReelReview("instagram", "Sarah M.", "female-1", 5, "Table magnifique !", 2, 4, "left");
        review.setId(10L);
        review.setReelConfig(config);
        config.setReviews(new ArrayList<>(List.of(review)));

        when(reelConfigRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(config));

        ReelConfigResponseDto response = reelService.getReelConfig();

        assertNotNull(response);
        assertEquals("/uploads/custom-reel.mp4", response.getVideoUrl());
        assertEquals(1, response.getReviews().size());
        assertEquals("Sarah M.", response.getReviews().get(0).getName());
        assertEquals(5, response.getReviews().get(0).getRating());
    }

    @Test
    @DisplayName("Devrait retourner la configuration par défaut si la base est vide")
    void testGetReelConfigDefaultFallback() {
        when(reelConfigRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.empty());

        ReelConfigResponseDto response = reelService.getReelConfig();

        assertNotNull(response);
        assertEquals("/Video-art.mp4", response.getVideoUrl());
        assertTrue(response.getReviews().isEmpty());
    }

    @Test
    @DisplayName("Devrait mettre à jour la configuration et remplacer les reviews associées")
    void testUpdateReelConfig() {
        ReelConfig existing = new ReelConfig("/old-video.mp4");
        existing.setId(1L);
        existing.setReviews(new ArrayList<>());

        when(reelConfigRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(existing));
        when(reelConfigRepository.save(any(ReelConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReelConfigRequestDto request = new ReelConfigRequestDto();
        request.setVideoUrl("https://supabase.co/storage/v1/object/public/artisanat-aschi-media/reel/new.mp4");

        ReelReviewRequestDto r1 = new ReelReviewRequestDto();
        r1.setPlatform("google");
        r1.setName("Karim B.");
        r1.setRating(5);
        r1.setText("Artisanat d'exception.");
        r1.setTime(3);
        r1.setDuration(5);
        r1.setPosition("right");

        request.setReviews(List.of(r1));

        ReelConfigResponseDto updated = reelService.updateReelConfig(request);

        assertNotNull(updated);
        assertEquals("https://supabase.co/storage/v1/object/public/artisanat-aschi-media/reel/new.mp4", updated.getVideoUrl());
        assertEquals(1, updated.getReviews().size());
        assertEquals("Karim B.", updated.getReviews().get(0).getName());
        assertEquals("google", updated.getReviews().get(0).getPlatform());
        assertEquals("right", updated.getReviews().get(0).getPosition());
    }

    @Test
    @DisplayName("Devrait supprimer la configuration par ID")
    void testDeleteReelConfig() {
        when(reelConfigRepository.existsById(1L)).thenReturn(true);

        reelService.deleteReelConfig(1L);

        verify(reelConfigRepository, times(1)).deleteById(1L);
    }
}
