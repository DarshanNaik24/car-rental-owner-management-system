package com.carrental.common.service;

import com.carrental.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new BusinessException("Could not create directory for uploads: " + ex.getMessage());
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Cannot upload empty file.");
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String newFileName = UUID.randomUUID() + fileExtension;

        try {
            Path targetDir = this.fileStorageLocation;
            if (subFolder != null && !subFolder.trim().isEmpty()) {
                targetDir = this.fileStorageLocation.resolve(subFolder.trim()).normalize();
                Files.createDirectories(targetDir);
            }

            Path targetLocation = targetDir.resolve(newFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            if (subFolder != null && !subFolder.trim().isEmpty()) {
                return "/api/uploads/" + subFolder.trim() + "/" + newFileName;
            } else {
                return "/api/uploads/" + newFileName;
            }
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file " + originalFilename + ": " + ex.getMessage());
        }
    }
}

