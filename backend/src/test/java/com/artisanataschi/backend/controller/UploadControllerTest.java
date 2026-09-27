package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.UploadResponseDto;
import com.artisanataschi.backend.service.storage.StorageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UploadControllerTest {

    @Mock
    private StorageService storageService;

    @InjectMocks
    private UploadController uploadController;

    @Test
    @DisplayName("Devrait accepter un upload JPEG valide avec magic bytes conformes")
    void testUploadValidJpegImage() {
        byte[] jpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01};
        MockMultipartFile file = new MockMultipartFile("file", "artisanat.jpg", "image/jpeg", jpegBytes);
        MockHttpServletRequest request = new MockHttpServletRequest();

        UploadResponseDto expectedDto = new UploadResponseDto("https://storage/public/artisanat.jpg", "images/uuid.jpg", "image/jpeg", (long) jpegBytes.length);
        when(storageService.uploadMedia(eq(file), eq("images"), any())).thenReturn(expectedDto);

        ResponseEntity<UploadResponseDto> response = uploadController.uploadImage(file, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("https://storage/public/artisanat.jpg", response.getBody().getUrl());
    }

    @Test
    @DisplayName("Devrait rejeter un fichier se faisant passer pour une image (spoofing MIME / magic bytes invalides)")
    void testRejectSpoofedImage() {
        byte[] fakeBytes = "<?php echo 'malicious'; ?>".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "fake.png", "image/png", fakeBytes);
        MockHttpServletRequest request = new MockHttpServletRequest();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                uploadController.uploadImage(file, request)
        );

        assertTrue(ex.getMessage().contains("signature binaire"));
    }

    @Test
    @DisplayName("Devrait rejeter une extension non autorisée (.exe)")
    void testRejectForbiddenExtension() {
        byte[] dummyBytes = new byte[]{0x01, 0x02, 0x03, 0x04};
        MockMultipartFile file = new MockMultipartFile("file", "payload.exe", "application/x-msdownload", dummyBytes);
        MockHttpServletRequest request = new MockHttpServletRequest();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                uploadController.uploadImage(file, request)
        );

        assertTrue(ex.getMessage().contains("non autorisée"));
    }

    @Test
    @DisplayName("Devrait rejeter un fichier contenant une tentative de path traversal (..)")
    void testRejectPathTraversal() {
        byte[] dummyBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile file = new MockMultipartFile("file", "../secret.jpg", "image/jpeg", dummyBytes);
        MockHttpServletRequest request = new MockHttpServletRequest();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                uploadController.uploadImage(file, request)
        );

        assertTrue(ex.getMessage().contains("Nom de fichier invalide"));
    }

    @Test
    @DisplayName("Devrait accepter une vidéo MP4 avec signature ftyp valide")
    void testUploadValidMp4Video() {
        // Offset 4: 'f', 't', 'y', 'p'
        byte[] mp4Bytes = new byte[]{0x00, 0x00, 0x00, 0x20, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm'};
        MockMultipartFile file = new MockMultipartFile("file", "reel.mp4", "video/mp4", mp4Bytes);
        MockHttpServletRequest request = new MockHttpServletRequest();

        UploadResponseDto expectedDto = new UploadResponseDto("https://storage/public/reel.mp4", "videos/uuid.mp4", "video/mp4", (long) mp4Bytes.length);
        when(storageService.uploadMedia(eq(file), eq("videos"), any())).thenReturn(expectedDto);

        ResponseEntity<UploadResponseDto> response = uploadController.uploadVideo(file, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("https://storage/public/reel.mp4", response.getBody().getUrl());
    }
}
