package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.ColorRequestDto;
import com.artisanataschi.backend.dto.ColorResponseDto;
import com.artisanataschi.backend.service.ColorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ColorController {

    @Autowired
    private ColorService colorService;

    // --- Endpoint Public ---
    @GetMapping("/public/colors")
    public ResponseEntity<List<ColorResponseDto>> getPublicColors() {
        return ResponseEntity.ok(colorService.getAllColors());
    }

    // --- Endpoints Admin (protégés par ROLE_ADMIN via WebSecurityConfig) ---
    @PostMapping("/admin/colors")
    public ResponseEntity<ColorResponseDto> createColor(@Valid @RequestBody ColorRequestDto dto) {
        ColorResponseDto created = colorService.createColor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/admin/colors/{id}")
    public ResponseEntity<ColorResponseDto> updateColor(
            @PathVariable String id,
            @Valid @RequestBody ColorRequestDto dto) {
        ColorResponseDto updated = colorService.updateColor(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/colors/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable String id) {
        colorService.deleteColor(id);
        return ResponseEntity.noContent().build();
    }
}
