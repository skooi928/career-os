package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.PostMediaDTO;
import com.cowhorse.career_os.service.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class MediaUploadController {

    private final MediaUploadService mediaUploadService;

    /**
     * POST /api/forum/upload
     *
     * Accepts a multipart file + supabaseUid, uploads to Supabase Storage,
     * returns a PostMediaDTO with the public URL.
     *
     * Angular forumService.uploadMedia() calls exactly this endpoint.
     */
    @PostMapping("/upload")
    public ResponseEntity<PostMediaDTO> uploadMedia(
            @RequestParam("file")        MultipartFile file,
            @RequestParam("supabaseUid") String supabaseUid) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        PostMediaDTO media = mediaUploadService.uploadToSupabase(file, supabaseUid);
        return ResponseEntity.ok(media);
    }
}