package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.SavedJob;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.repository.JobRepository;
import com.cowhorse.career_os.repository.SavedJobRepository;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Transactional
public class SavedJobController {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final DashboardService dashboardService;
    private final JwtTokenProvider jwtTokenProvider;

    private String getUidFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isEmpty()) {
            throw new AuthenticationException("Missing Authorization header");
        }
        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("Invalid Authorization header format. Expected 'Bearer <token>'");
        }
        
        String token = authorizationHeader.substring(7);
        try {
            return jwtTokenProvider.getUidFromToken(token);
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<SavedJob> saveJob(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody SavedJob savedJob) {
        
        String uid = getUidFromHeader(authorizationHeader);
        UUID userUuid = UUID.fromString(uid);
        savedJob.setUserId(userUuid);

        // Check if already saved
        if (savedJobRepository.findByUserIdAndJobId(userUuid, savedJob.getJobId()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        SavedJob saved = savedJobRepository.save(savedJob);

        // Log activity
        jobRepository.findById(saved.getJobId()).ifPresent(job -> {
            String activityTitle = "Saved job: <strong>" + job.getTitle() + "</strong> at <strong>" + job.getCompany() + "</strong>";
            dashboardService.logActivity(userUuid, "PROFILE", activityTitle);
        });

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getSavedJobs(
            @RequestHeader("Authorization") String authorizationHeader) {
        
        String uid = getUidFromHeader(authorizationHeader);
        UUID userUuid = UUID.fromString(uid);

        List<SavedJob> savedList = savedJobRepository.findByUserIdOrderByCreatedAtDesc(userUuid);
        List<Job> jobs = savedList.stream()
                .map(sj -> jobRepository.findById(sj.getJobId()).orElse(null))
                .filter(job -> job != null)
                .collect(Collectors.toList());

        return ResponseEntity.ok(jobs);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> unsaveJob(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID jobId) {
        
        String uid = getUidFromHeader(authorizationHeader);
        UUID userUuid = UUID.fromString(uid);

        savedJobRepository.deleteByUserIdAndJobId(userUuid, jobId);
        
        // Log activity
        jobRepository.findById(jobId).ifPresent(job -> {
            String activityTitle = "Removed saved job: <strong>" + job.getTitle() + "</strong>";
            dashboardService.logActivity(userUuid, "PROFILE", activityTitle);
        });

        return ResponseEntity.noContent().build();
    }
}
