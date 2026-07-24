package com.artisanataschi.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService() {
        this.uploadPath = Paths.get("uploads");
        try {
            if (!Files.exists(this.uploadPath)) {
                Files.createDirectories(this.uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String storeFile(MultipartFile file, HttpServletRequest request) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Veuillez sélectionner un fichier.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") &&
                                    !contentType.equals("image/png") &&
                                    !contentType.equals("image/webp") &&
                                    !contentType.equals("image/jpg") &&
                                    !contentType.equals("video/mp4") &&
                                    !contentType.equals("video/webm") &&
                                    !contentType.equals("video/ogg") &&
                                    !contentType.equals("video/quicktime"))) {
            throw new IllegalArgumentException("Format de fichier non supporté. Veuillez utiliser jpg, png, webp, mp4, webm, ou mov.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de l'image.", e);
        }

        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath(); // /api
        
        return scheme + "://" + serverName + ":" + serverPort + contextPath + "/uploads/" + fileName;
    }
}
