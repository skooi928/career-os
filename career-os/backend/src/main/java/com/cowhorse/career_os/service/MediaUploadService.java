package com.cowhorse.career_os.service;

import com.cowhorse.career_os.config.SupabaseClient;
import com.cowhorse.career_os.dto.PostMediaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaUploadService {

    private final SupabaseClient supabaseClient;
    private final RestTemplate restTemplate;

    // Name of the bucket you create in Supabase Storage dashboard
    private static final String BUCKET = "forum-media";

    /**
     * Uploads a file to Supabase Storage and returns a PostMediaDTO
     * with the public URL ready to persist on the post.
     */
    public PostMediaDTO uploadToSupabase(MultipartFile file, String supabaseUid) {
        try {
            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
            );

            // Unique path: userId/uuid-originalname  (keeps files organised per user)
            String storagePath = supabaseUid + "/" + UUID.randomUUID() + "-" + originalName;

            String uploadUrl = supabaseClient.getUrl()
                    + "/storage/v1/object/" + BUCKET + "/" + storagePath;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey",        supabaseClient.getServiceKey());
            headers.set("Authorization", "Bearer " + supabaseClient.getServiceKey());
            headers.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream"
            ));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, entity, String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Supabase Storage upload failed: " + response.getStatusCode());
            }

            // Build the public URL
            String publicUrl = supabaseClient.getUrl()
                    + "/storage/v1/object/public/" + BUCKET + "/" + storagePath;

            return PostMediaDTO.builder()
                    .url(publicUrl)
                    .mediaType(resolveMediaType(file.getContentType()))
                    .fileName(originalName)
                    .fileSize(file.getSize())
                    .build();

        } catch (IOException e) {
            log.error("Failed to read upload file bytes: {}", e.getMessage());
            throw new RuntimeException("File read failed: " + e.getMessage());
        }
    }

    /**
     * Maps MIME type → simple category string the frontend expects.
     * (image / pdf / video / file)
     */
    private String resolveMediaType(String mimeType) {
        if (mimeType == null) return "file";
        if (mimeType.startsWith("image/"))  return "image";
        if (mimeType.equals("application/pdf")) return "pdf";
        if (mimeType.startsWith("video/"))  return "video";
        return "file";
    }
}