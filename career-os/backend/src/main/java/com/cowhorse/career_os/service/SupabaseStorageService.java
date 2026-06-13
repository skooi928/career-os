package com.cowhorse.career_os.service;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.cowhorse.career_os.config.SupabaseClient;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);
    private final SupabaseClient supabaseClient;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
        this.restTemplate = new RestTemplate();
    }

    public String uploadFile(MultipartFile file, String bucketName) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        String uploadUrl = supabaseClient.getUrl() + "/storage/v1/object/" + bucketName + "/" + fileName;

        // Use service-key (bypasses RLS) for server-side uploads, fall back to api-key
        String storageKey = supabaseClient.getStorageKey();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(storageKey);
        headers.set("apikey", storageKey);
        headers.setContentType(MediaType.valueOf(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseClient.getUrl() + "/storage/v1/object/public/" + bucketName + "/" + fileName;
            } else {
                throw new RuntimeException("Supabase storage rejected upload: " + response.getBody());
            }
        } catch (HttpStatusCodeException e) {
            String body = e.getResponseBodyAsString();
            log.error("Supabase storage error {} for bucket '{}': {}", e.getStatusCode(), bucketName, body);
            throw new RuntimeException("Supabase storage error (" + e.getStatusCode() + "): " + body);
        } catch (Exception e) {
            log.error("Exception during file upload to Supabase bucket '{}'", bucketName, e);
            throw new RuntimeException("Exception during file upload: " + e.getMessage(), e);
        }
    }

    public String uploadResume(MultipartFile file) throws IOException {
        return uploadFile(file, "resumes");
    }
}
