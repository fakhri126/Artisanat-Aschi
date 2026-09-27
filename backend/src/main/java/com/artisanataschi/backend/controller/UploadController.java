package com.artisanataschi.backend.controller;

import com.artisanataschi.backend.dto.UploadResponseDto;
import com.artisanataschi.backend.service.storage.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/admin/uploads")
public class UploadController {

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp", ".gif");
    private static final List<String> ALLOWED_IMAGE_MIMES = Arrays.asList("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB

    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = Arrays.asList(".mp4", ".webm", ".mov");
    private static final List<String> ALLOWED_VIDEO_MIMES = Arrays.asList("video/mp4", "video/webm", "video/quicktime");
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

    @Autowired
    private StorageService storageService;

    @PostMapping("/image")
    public ResponseEntity<UploadResponseDto> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        validateFile(file, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE, "image");
        validateImageMagicBytes(file);

        UploadResponseDto response = storageService.uploadMedia(file, "images", request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/video")
    public ResponseEntity<UploadResponseDto> uploadVideo(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        validateFile(file, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_VIDEO_MIMES, MAX_VIDEO_SIZE, "vidéo");
        validateVideoMagicBytes(file);

        UploadResponseDto response = storageService.uploadMedia(file, "videos", request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private void validateFile(MultipartFile file, List<String> allowedExtensions, List<String> allowedMimes, long maxSize, String mediaType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Veuillez sélectionner un fichier non vide.");
        }

        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(String.format("La taille du fichier dépasse la limite autorisée de %d Mo pour une %s.", maxSize / (1024 * 1024), mediaType));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Le fichier doit posséder une extension valide.");
        }

        // Protection contre le Path Traversal dans le nom original
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase().trim();
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException(String.format("Extension '%s' non autorisée pour une %s. Extensions permises : %s", extension, mediaType, String.join(", ", allowedExtensions)));
        }

        String contentType = file.getContentType();
        if (contentType != null && !allowedMimes.contains(contentType.toLowerCase().trim())) {
            throw new IllegalArgumentException(String.format("Type MIME '%s' non autorisé pour une %s.", contentType, mediaType));
        }
    }

    private void validateImageMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
            if (read < 4) {
                throw new IllegalArgumentException("Fichier corrompu ou trop court.");
            }

            boolean isJpeg = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF);
            boolean isPng = (header[0] == (byte) 0x89 && header[1] == (byte) 0x50 && header[2] == (byte) 0x4E && header[3] == (byte) 0x47);
            boolean isGif = (header[0] == (byte) 'G' && header[1] == (byte) 'I' && header[2] == (byte) 'F' && header[3] == (byte) '8');
            boolean isWebp = (read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                    && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P');

            if (!isJpeg && !isPng && !isGif && !isWebp) {
                throw new IllegalArgumentException("La signature binaire du fichier ne correspond pas à une image valide.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossible d'inspecter les données binaires du fichier.", e);
        }
    }

    private void validateVideoMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
            if (read < 4) {
                throw new IllegalArgumentException("Fichier vidéo corrompu ou trop court.");
            }

            // MP4 / QuickTime (ftyp at offset 4)
            boolean isMp4OrMov = (read >= 8 && header[4] == 'f' && header[5] == 't' && header[6] == 'y' && header[7] == 'p');
            // WebM / Matroska (1A 45 DF A3)
            boolean isWebm = (header[0] == 0x1A && header[1] == 0x45 && header[2] == (byte) 0xDF && header[3] == (byte) 0xA3);

            if (!isMp4OrMov && !isWebm) {
                throw new IllegalArgumentException("La signature binaire du fichier ne correspond pas à un format vidéo autorisé.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossible d'inspecter les données de la vidéo.", e);
        }
    }
}
