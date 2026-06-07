package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.ResumeDTO;
import com.cowhorse.career_os.dto.RoadmapRequestDTO;
import com.cowhorse.career_os.dto.RoadmapResponseDTO;
import com.cowhorse.career_os.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    /**
     * POST /api/resume/upload
     *
     * Accepts a PDF file and the user's Supabase UID.
     * Calls FastAPI for extraction, saves all data to Supabase.
     *
     * Request: multipart/form-data
     *   - file: the PDF resume
     *   - supabaseUid: the user's UUID from Supabase Auth
     *
     * Response: the extracted ResumeDTO
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(
            @RequestPart("file") MultipartFile file,
            @RequestPart("supabaseUid") String supabaseUid
    ) {
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "File is empty")
            );
        }

        if (!isPdf(file)) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Only PDF files are supported")
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            return ResponseEntity.badRequest().body(
                Map.of("error", "File size exceeds 10MB limit")
            );
        }

        // Validate UUID format
        try {
            java.util.UUID.fromString(supabaseUid);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Invalid user ID format")
            );
        }

        log.info("Resume upload request — user: {}, file: {}, size: {}KB",
                supabaseUid, file.getOriginalFilename(), file.getSize() / 1024);

        try {
            ResumeDTO result = resumeService.processAndSaveResume(file, supabaseUid);
            return ResponseEntity.ok(Map.of(
                "message", "Resume processed and saved successfully",
                "data", result
            ));
        } catch (RuntimeException e) {
            log.error("Resume processing failed for user {}: {}", supabaseUid, e.getMessage());
            return ResponseEntity.status(502).body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            log.error("Unexpected error for user {}: {}", supabaseUid, e.getMessage());
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Unexpected error during resume processing")
            );
        }
    }

    /**
     * GET /api/resume/{supabaseUid}
     * Returns extracted resume data for a user — used by the profile page.
     * (Implement fully once profile page needs it)
     */
    @GetMapping("/{supabaseUid}")
    public ResponseEntity<?> getResume(@PathVariable String supabaseUid) {
        // TODO: implement fetch from all resume tables
        return ResponseEntity.ok(Map.of("message", "Resume fetch coming soon"));
    }

    @PostMapping("/roadmap/generate")
    public ResponseEntity<?> generateRoadmap(
            @RequestBody RoadmapRequestDTO request
    ) {

        try {

            RoadmapResponseDTO response =
                    resumeService.generateRoadmap(request);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            log.error("Roadmap generation failed", e);

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }
    private boolean isPdf(MultipartFile file) {
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        return (contentType != null && contentType.equals("application/pdf"))
                || (filename != null && filename.toLowerCase().endsWith(".pdf"));
    }
}