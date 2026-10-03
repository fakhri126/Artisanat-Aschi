package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.ColorRequestDto;
import com.artisanataschi.backend.dto.ColorResponseDto;
import com.artisanataschi.backend.service.ColorService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ColorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ColorService colorService;

    @InjectMocks
    private ColorController colorController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(colorController).build();
    }

    @Test
    @DisplayName("GET /public/colors - Devrait renvoyer 200 OK avec le tableau des couleurs")
    void testGetPublicColors() throws Exception {
        ColorResponseDto c1 = new ColorResponseDto("bois-naturel", "Bois Naturel", "#C4A482", true);
        when(colorService.getAllColors()).thenReturn(List.of(c1));

        mockMvc.perform(get("/public/colors"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value("bois-naturel"))
                .andExpect(jsonPath("$[0].label").value("Bois Naturel"))
                .andExpect(jsonPath("$[0].hex").value("#C4A482"))
                .andExpect(jsonPath("$[0].isDefault").value(true));

        verify(colorService, times(1)).getAllColors();
    }

    @Test
    @DisplayName("POST /admin/colors - Devrait créer une couleur et renvoyer 201 Created")
    void testCreateColorValid() throws Exception {
        ColorRequestDto request = new ColorRequestDto();
        request.setLabel("Noyer Doré");
        request.setHex("#8B4513");
        request.setIsDefault(false);

        ColorResponseDto created = new ColorResponseDto("noyer-dore", "Noyer Doré", "#8B4513", false);
        when(colorService.createColor(any(ColorRequestDto.class))).thenReturn(created);

        mockMvc.perform(post("/admin/colors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("noyer-dore"))
                .andExpect(jsonPath("$.label").value("Noyer Doré"))
                .andExpect(jsonPath("$.hex").value("#8B4513"));
    }

    @Test
    @DisplayName("POST /admin/colors - Devrait renvoyer 400 Bad Request si validation DTO échoue (champ obligatoire manquant)")
    void testCreateColorInvalidValidation() throws Exception {
        ColorRequestDto request = new ColorRequestDto();
        // missing label and hex

        mockMvc.perform(post("/admin/colors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(colorService, never()).createColor(any());
    }

    @Test
    @DisplayName("PUT /admin/colors/{id} - Devrait mettre à jour et renvoyer 200 OK")
    void testUpdateColorValid() throws Exception {
        ColorRequestDto request = new ColorRequestDto();
        request.setLabel("Noyer Ancien");
        request.setHex("#5C4033");

        ColorResponseDto updated = new ColorResponseDto("noyer-ancien", "Noyer Ancien", "#5C4033", false);
        when(colorService.updateColor(eq("noyer-ancien"), any(ColorRequestDto.class))).thenReturn(updated);

        mockMvc.perform(put("/admin/colors/noyer-ancien")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Noyer Ancien"));
    }

    @Test
    @DisplayName("DELETE /admin/colors/{id} - Devrait supprimer et renvoyer 204 No Content")
    void testDeleteColor() throws Exception {
        doNothing().when(colorService).deleteColor("noyer-ancien");

        mockMvc.perform(delete("/admin/colors/noyer-ancien"))
                .andExpect(status().isNoContent());

        verify(colorService, times(1)).deleteColor("noyer-ancien");
    }
}
