package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.DashboardSummaryDTO;
import com.cowhorse.career_os.entity.JobApplication;
import com.cowhorse.career_os.entity.UserActivity;
import com.cowhorse.career_os.repository.ActualInterviewRepository;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import com.cowhorse.career_os.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final JobApplicationRepository jobApplicationRepository;
    private final ActualInterviewRepository actualInterviewRepository;
    private final UserActivityRepository userActivityRepository;

    public DashboardSummaryDTO getDashboardSummary(UUID candidateId) {
        log.info("Fetching dashboard summary for candidate: {}", candidateId);

        // Fetch applications to calculate stats
        List<JobApplication> applications = jobApplicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
        
        long applicationsCount = applications.size();
        
        // Count applications with statuses indicating an offer
        long offersCount = applications.stream()
                .filter(app -> app.getStatus() != null && 
                        Arrays.asList("OFFER", "OFFERED", "ACCEPTED").contains(app.getStatus().toUpperCase()))
                .count();

        // Fetch actual interviews to count scheduled or total interviews
        long interviewsCount = actualInterviewRepository.findByCandidateIdOrderByScheduledAtDesc(candidateId).size();

        // Fetch top 5 recent activities for this user
        Pageable topFive = PageRequest.of(0, 5);
        List<UserActivity> recentActivities = userActivityRepository.findByUserIdOrderByCreatedAtDesc(candidateId, topFive);

        return DashboardSummaryDTO.builder()
                .applicationsCount(applicationsCount)
                .interviewsCount(interviewsCount)
                .offersCount(offersCount)
                .recentActivities(recentActivities)
                .build();
    }

    public void logActivity(UUID userId, String type, String title) {
        try {
            UserActivity activity = UserActivity.builder()
                    .userId(userId)
                    .type(type)
                    .title(title)
                    .build();
            userActivityRepository.save(activity);
            log.info("Logged activity '{}' of type '{}' for user {}", title, type, userId);
        } catch (Exception e) {
            log.error("Failed to log activity for user {}", userId, e);
        }
    }
}
