package com.artisanataschi.backend.service.storage;

import com.artisanataschi.backend.dto.UploadResponseDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

public interface StorageService {
    String storeFile(MultipartFile file, HttpServletRequest request);
    UploadResponseDto uploadMedia(MultipartFile file, String folder, HttpServletRequest request);
    Resource loadAsResource(String filename);
    void deleteFile(String filename);
}
