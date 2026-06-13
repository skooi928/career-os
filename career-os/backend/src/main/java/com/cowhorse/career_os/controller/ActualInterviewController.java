package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.ActualInterview;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.repository.ActualInterviewRepository;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActualInterviewController {

    private final ActualInterviewRepository actualInterviewRepository;
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
    public ResponseEntity<ActualInterview> scheduleInterview(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody ActualInterview interview) {
        
        if (interview.getCandidateId() == null) {
            String uid = getUidFromHeader(authorizationHeader);
            interview.setCandidateId(UUID.fromString(uid));
        }

        ActualInterview saved = actualInterviewRepository.save(interview);

        // Log activity
        String companyName = saved.getCompany() != null ? saved.getCompany() : "Employer";
        String activityTitle = "Interview (" + saved.getTitle() + ") scheduled with <strong>" + companyName + "</strong>";
        dashboardService.logActivity(saved.getCandidateId(), "INTERVIEW", activityTitle);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<ActualInterview>> getInterviewsByCandidate(@PathVariable UUID candidateId) {
        List<ActualInterview> interviews = actualInterviewRepository.findByCandidateIdOrderByScheduledAtDesc(candidateId);
        return ResponseEntity.ok(interviews);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInterview(@PathVariable UUID id) {
        actualInterviewRepository.findById(id).ifPresent(interview -> {
            actualInterviewRepository.delete(interview);
            String companyName = interview.getCompany() != null ? interview.getCompany() : "Employer";
            String activityTitle = "Interview (" + interview.getTitle() + ") with <strong>" + companyName + "</strong> was cancelled";
            dashboardService.logActivity(interview.getCandidateId(), "INTERVIEW", activityTitle);
        });
        return ResponseEntity.noContent().build();
    }
}
