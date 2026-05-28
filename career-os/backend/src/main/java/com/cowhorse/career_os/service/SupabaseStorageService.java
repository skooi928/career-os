package com.cowhorse.career_os.service;

import com.cowhorse.career_os.config.SupabaseClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);
    private final SupabaseClient supabaseClient;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
        this.restTemplate = new RestTemplate();
    }

    public String uploadResume(MultipartFile file) throws IOException {
        String bucketName = "resumes";
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Generate a unique filename to prevent collisions
        String fileName = UUID.randomUUID().toString() + extension;
        String objectPath = fileName;

        String uploadUrl = supabaseClient.getUrl() + "/storage/v1/object/" + bucketName + "/" + objectPath;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseClient.getApiKey());
        headers.set("apikey", supabaseClient.getApiKey());
        // Supabase storage requires the content type to be set accurately
        headers.setContentType(MediaType.valueOf(file.getContentType() != null ? file.getContentType() : "application/pdf"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Return the public URL
                return supabaseClient.getUrl() + "/storage/v1/object/public/" + bucketName + "/" + objectPath;
            } else {
                log.error("Failed to upload file to Supabase. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to upload file to Supabase");
            }
        } catch (Exception e) {
            log.error("Exception during file upload to Supabase", e);
            throw new RuntimeException("Exception during file upload to Supabase: " + e.getMessage(), e);
        }
    }
}
