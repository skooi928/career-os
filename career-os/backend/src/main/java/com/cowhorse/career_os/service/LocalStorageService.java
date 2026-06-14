package com.cowhorse.career_os.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService {
    private final Path rootLocation = Paths.get("uploads");

    public LocalStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String uploadFile(MultipartFile file, UUID candidateId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".webm";
                
        String filename = candidateId.toString() + "_" + UUID.randomUUID().toString() + extension;
        Path destinationFile = this.rootLocation.resolve(Paths.get(filename))
                .normalize().toAbsolutePath();

        if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
            throw new RuntimeException("Cannot store file outside current directory.");
        }

        file.transferTo(destinationFile);
        
        // Return a local URL that can be served by our Spring Boot app
        // return "http://localhost:8080/uploads/" + filename;
        return "https://career-os-production-6ab0.up.railway.app/uploads/" + filename; // Relative URL to be served by Spring Boot
    }
}
