package com.artisanataschi.backend.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

public interface StorageService {
    String storeFile(MultipartFile file, HttpServletRequest request);
    Resource loadAsResource(String filename);
    void deleteFile(String filename);
}
