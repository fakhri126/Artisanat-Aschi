package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.ReelConfigRequestDto;
import com.artisanataschi.backend.dto.ReelConfigResponseDto;
import com.artisanataschi.backend.service.ReelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ReelController {

    @Autowired
    private ReelService reelService;

    // --- Endpoint Public ---
    @GetMapping("/public/reels")
    public ResponseEntity<ReelConfigResponseDto> getPublicReel() {
        return ResponseEntity.ok(reelService.getReelConfig());
    }

    // --- Endpoints Admin (protégés par ROLE_ADMIN via WebSecurityConfig) ---
    @PostMapping("/admin/reels")
    public ResponseEntity<ReelConfigResponseDto> createOrUpdateReel(@Valid @RequestBody ReelConfigRequestDto dto) {
        ReelConfigResponseDto saved = reelService.updateReelConfig(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/admin/reels/{id}")
    public ResponseEntity<ReelConfigResponseDto> updateReel(
            @PathVariable Long id,
            @Valid @RequestBody ReelConfigRequestDto dto) {
        ReelConfigResponseDto updated = reelService.updateReelConfig(dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/reels/{id}")
    public ResponseEntity<Void> deleteReel(@PathVariable Long id) {
        reelService.deleteReelConfig(id);
        return ResponseEntity.noContent().build();
    }
}
