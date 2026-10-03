package com.artisanataschi.backend.service.storage;

import com.artisanataschi.backend.dto.UploadResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
@Primary
public class SupabaseStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    @Value("${supabase.url:https://uerbqswgxsinayfyntsm.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String supabaseServiceKey;

    @Value("${supabase.storage.bucket:artisanat-aschi-media}")
    private String bucketName;

    @Autowired(required = false)
    private com.artisanataschi.backend.service.FileStorageService fallbackStorageService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public String storeFile(MultipartFile file, HttpServletRequest request) {
        UploadResponseDto response = uploadMedia(file, "general", request);
        return response.getUrl();
    }

    @Override
    public UploadResponseDto uploadMedia(MultipartFile file, String folder, HttpServletRequest request) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier envoyé est vide.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase().trim();
        }

        // Nom unique sécurisé généré par UUID (protection contre le Path Traversal et collision)
        String cleanFolder = folder.replaceAll("[^a-zA-Z0-9_-]", "");
        String filename = UUID.randomUUID() + extension;
        String objectPath = cleanFolder + "/" + filename;

        // Si la clé de service Supabase est configurée, uploader directement sur Supabase Storage
        if (supabaseServiceKey != null && !supabaseServiceKey.isBlank()) {
            try {
                String cleanBaseUrl = supabaseUrl.replaceAll("/+$", "");
                String uploadEndpoint = cleanBaseUrl + "/storage/v1/object/" + bucketName + "/" + objectPath;

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(uploadEndpoint))
                        .timeout(Duration.ofSeconds(60))
                        .header("Authorization", "Bearer " + supabaseServiceKey.trim())
                        .header("apikey", supabaseServiceKey.trim())
                        .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                        .header("x-upsert", "true")
                        .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                        .build();

                HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                    String publicUrl = cleanBaseUrl + "/storage/v1/object/public/" + bucketName + "/" + objectPath;
                    log.info("✅ Fichier uploadé avec succès vers Supabase Storage : {}", publicUrl);
                    return new UploadResponseDto(publicUrl, objectPath, file.getContentType(), file.getSize());
                } else {
                    log.error("Échec de l'upload Supabase Storage (code {}) : {}", httpResponse.statusCode(), httpResponse.body());
                    throw new RuntimeException("Erreur de stockage Supabase Storage : " + httpResponse.body());
                }
            } catch (IOException | InterruptedException e) {
                log.error("Exception lors de l'upload vers Supabase Storage, bascule sur le stockage de secours", e);
                if (fallbackStorageService != null) {
                    String localUrl = fallbackStorageService.storeFile(file, request);
                    return new UploadResponseDto(localUrl, objectPath, file.getContentType(), file.getSize());
                }
                throw new RuntimeException("Impossible d'uploader le fichier vers le stockage distant.", e);
            }
        }

        // Fallback local gracieux si aucune clé Supabase n'est renseignée (local dev / environnement de test)
        log.warn("⚠️ SUPABASE_SERVICE_KEY non configurée. Enregistrement local temporaire.");
        if (fallbackStorageService != null) {
            String localUrl = fallbackStorageService.storeFile(file, request);
            return new UploadResponseDto(localUrl, objectPath, file.getContentType(), file.getSize());
        }

        throw new IllegalStateException("Aucun service de stockage disponible.");
    }

    @Override
    public Resource loadAsResource(String filename) {
        if (fallbackStorageService != null) {
            return fallbackStorageService.loadAsResource(filename);
        }
        throw new UnsupportedOperationException("Le chargement direct de ressources locales n'est pas supporté en mode Supabase Storage.");
    }

    @Override
    public void deleteFile(String filename) {
        if (supabaseServiceKey != null && !supabaseServiceKey.isBlank()) {
            try {
                String cleanBaseUrl = supabaseUrl.replaceAll("/+$", "");
                String deleteEndpoint = cleanBaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(deleteEndpoint))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + supabaseServiceKey.trim())
                        .header("apikey", supabaseServiceKey.trim())
                        .DELETE()
                        .build();

                httpClient.send(httpRequest, HttpResponse.BodyHandlers.discarding());
                log.info("Fichier supprimé de Supabase Storage : {}", filename);
            } catch (Exception e) {
                log.warn("Impossible de supprimer le fichier de Supabase Storage : {}", filename, e);
            }
        } else if (fallbackStorageService != null) {
            fallbackStorageService.deleteFile(filename);
        }
    }
}
