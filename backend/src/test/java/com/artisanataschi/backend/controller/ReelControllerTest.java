package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.ReelConfigRequestDto;
import com.artisanataschi.backend.dto.ReelConfigResponseDto;
import com.artisanataschi.backend.dto.ReelReviewResponseDto;
import com.artisanataschi.backend.service.ReelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ReelControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReelService reelService;

    @InjectMocks
    private ReelController reelController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reelController).build();
    }

    @Test
    @DisplayName("GET /public/reels - Devrait retourner la configuration active")
    void testGetPublicReel() throws Exception {
        ReelReviewResponseDto r = new ReelReviewResponseDto(1L, "instagram", "Fatma", "avatar-1", 5, "Super travail", 2, 4, "left");
        ReelConfigResponseDto cfg = new ReelConfigResponseDto(1L, "/Video-art.mp4", List.of(r), null);

        when(reelService.getReelConfig()).thenReturn(cfg);

        mockMvc.perform(get("/public/reels"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.videoUrl").value("/Video-art.mp4"))
                .andExpect(jsonPath("$.reviews[0].name").value("Fatma"))
                .andExpect(jsonPath("$.reviews[0].rating").value(5));

        verify(reelService, times(1)).getReelConfig();
    }

    @Test
    @DisplayName("POST /admin/reels - Devrait enregistrer et renvoyer 201 Created")
    void testCreateOrUpdateReel() throws Exception {
        ReelConfigRequestDto request = new ReelConfigRequestDto();
        request.setVideoUrl("https://supabase.co/video.mp4");

        ReelConfigResponseDto responseDto = new ReelConfigResponseDto(1L, "https://supabase.co/video.mp4", List.of(), null);
        when(reelService.updateReelConfig(any(ReelConfigRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/admin/reels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.videoUrl").value("https://supabase.co/video.mp4"));
    }

    @Test
    @DisplayName("DELETE /admin/reels/{id} - Devrait supprimer et renvoyer 204 No Content")
    void testDeleteReel() throws Exception {
        doNothing().when(reelService).deleteReelConfig(1L);

        mockMvc.perform(delete("/admin/reels/1"))
                .andExpect(status().isNoContent());

        verify(reelService, times(1)).deleteReelConfig(1L);
    }
}
