package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.SavedJob;
import com.cowhorse.career_os.service.SavedJobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    public SavedJobController(SavedJobService savedJobService) {
        this.savedJobService = savedJobService;
    }

    @PostMapping
    public ResponseEntity<SavedJob> saveJob(@RequestBody Map<String, String> payload) {
        UUID userId = UUID.fromString(payload.get("userId"));
        UUID jobId = UUID.fromString(payload.get("jobId"));
        SavedJob savedJob = savedJobService.saveJob(userId, jobId);
        return ResponseEntity.ok(savedJob);
    }

    @DeleteMapping("/{jobId}/user/{userId}")
    public ResponseEntity<Void> unsaveJob(@PathVariable UUID jobId, @PathVariable UUID userId) {
        savedJobService.unsaveJob(userId, jobId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedJob>> getSavedJobsForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(savedJobService.getSavedJobsForUser(userId));
    }

    @GetMapping("/{jobId}/user/{userId}/check")
    public ResponseEntity<Boolean> checkSaved(@PathVariable UUID jobId, @PathVariable UUID userId) {
        return ResponseEntity.ok(savedJobService.isJobSaved(userId, jobId));
    }
}
