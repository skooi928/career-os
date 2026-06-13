package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.JobApplication;
import com.cowhorse.career_os.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;
    private final com.cowhorse.career_os.service.SupabaseStorageService storageService;
    private final tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();

    public JobApplicationController(JobApplicationService service, 
                                    com.cowhorse.career_os.service.SupabaseStorageService storageService) {
        this.service = service;
        this.storageService = storageService;
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobApplication> submitApplication(
            @RequestPart("application") String applicationJson,
            @RequestPart(value = "resume", required = false) org.springframework.web.multipart.MultipartFile resume) {
        
        try {
            JobApplication application = objectMapper.readValue(applicationJson, JobApplication.class);
            
            if (resume != null && !resume.isEmpty()) {
                String resumeUrl = storageService.uploadResume(resume);
                application.setResumeUrl(resumeUrl);
            }
            
            return ResponseEntity.ok(service.applyForJob(application));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByCandidate(@PathVariable UUID candidateId) {
        return ResponseEntity.ok(service.getApplicationsByCandidate(candidateId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(service.getApplicationsByJob(jobId));
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByEmployer(@PathVariable UUID employerId) {
        return ResponseEntity.ok(service.getApplicationsByEmployer(employerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable UUID id, 
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        JobApplication app = service.updateApplicationStatus(id, status);
        if (app != null) {
            return ResponseEntity.ok(app);
        }
        return ResponseEntity.notFound().build();
    }
}
