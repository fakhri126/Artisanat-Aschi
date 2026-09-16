package com.artisanataschi.backend.service;

import com.artisanataschi.backend.service.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService implements StorageService {

    private final Path uploadPath;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm", ".mov");

    public FileStorageService() {
        this.uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            if (!Files.exists(this.uploadPath)) {
                Files.createDirectories(this.uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, HttpServletRequest request) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Veuillez sélectionner un fichier non vide.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Le fichier doit comporter une extension valide.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase().trim();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Format de fichier non autorisé. Extensions permises : jpg, jpeg, png, webp, mp4, webm, mov.");
        }

        // Inspection binaire des Magic Bytes pour contrer les faux Content-Types et scripts malveillants
        validateMagicBytes(file, extension);

        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(fileName).normalize();

        // Protection contre le Path Traversal
        if (!filePath.startsWith(uploadPath)) {
            throw new SecurityException("Chemin de fichier non autorisé.");
        }

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier.", e);
        }

        // Construction sécurisée de l'URL respectant les reverse proxies (X-Forwarded-Proto / Host)
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null) scheme = request.getScheme();

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null) {
            host = request.getServerName();
            int port = request.getServerPort();
            if ((scheme.equals("http") && port != 80) || (scheme.equals("https") && port != 443)) {
                host = host + ":" + port;
            }
        }

        String contextPath = request.getContextPath(); // /api
        return scheme + "://" + host + contextPath + "/uploads/" + fileName;
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = uploadPath.resolve(filename).normalize();
            if (!file.startsWith(uploadPath)) {
                throw new SecurityException("Accès non autorisé.");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Fichier introuvable : " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("URL invalide pour le fichier : " + filename, e);
        }
    }

    @Override
    public void deleteFile(String filename) {
        try {
            Path file = uploadPath.resolve(filename).normalize();
            if (file.startsWith(uploadPath)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            // Log warning without failing
        }
    }

    private void validateMagicBytes(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
            if (read < 4) {
                throw new IllegalArgumentException("Fichier corrompu ou trop court.");
            }

            boolean isValid = false;
            // JPEG: FF D8 FF
            if ((extension.equals(".jpg") || extension.equals(".jpeg")) &&
                (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF)) {
                isValid = true;
            }
            // PNG: 89 50 4E 47
            else if (extension.equals(".png") &&
                (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47)) {
                isValid = true;
            }
            // WebP: RIFF ... WEBP
            else if (extension.equals(".webp") &&
                (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F')) {
                isValid = true;
            }
            // MP4 / QuickTime: 'ftyp' at offset 4
            else if ((extension.equals(".mp4") || extension.equals(".mov")) && read >= 8 &&
                (header[4] == 'f' && header[5] == 't' && header[6] == 'y' && header[7] == 'p')) {
                isValid = true;
            }
            // WebM / Matroska: 1A 45 DF A3
            else if (extension.equals(".webm") &&
                (header[0] == 0x1A && header[1] == 0x45 && header[2] == (byte) 0xDF && header[3] == (byte) 0xA3)) {
                isValid = true;
            }

            if (!isValid) {
                throw new IllegalArgumentException("Le contenu du fichier ne correspond pas à l'extension déclarée (" + extension + ").");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossible de lire les données du fichier.", e);
        }
    }
}
