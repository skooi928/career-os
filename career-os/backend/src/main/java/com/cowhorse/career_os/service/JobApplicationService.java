package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.JobApplication;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import com.cowhorse.career_os.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final JobRepository jobRepository;
    private final DashboardService dashboardService;

    public JobApplicationService(JobApplicationRepository repository, JobRepository jobRepository, DashboardService dashboardService) {
        this.repository = repository;
        this.jobRepository = jobRepository;
        this.dashboardService = dashboardService;
    }

    public JobApplication applyForJob(JobApplication application) {
        if (application.getAnswers() != null) {
            for (com.cowhorse.career_os.entity.JobApplicationAnswer answer : application.getAnswers()) {
                answer.setJobApplication(application);
            }
        }
        
        JobApplication saved = repository.save(application);
        
        // Log user activity
        try {
            jobRepository.findById(application.getJobId()).ifPresent(job -> {
                String companyName = job.getCompany() != null ? job.getCompany() : "Employer";
                String activityTitle = "Application sent to <strong>" + companyName + "</strong>";
                dashboardService.logActivity(application.getCandidateId(), "APPLICATION", activityTitle);
            });
        } catch (Exception e) {
            dashboardService.logActivity(application.getCandidateId(), "APPLICATION", "Application submitted");
        }
        
        return saved;
    }

    public List<JobApplication> getApplicationsByCandidate(UUID candidateId) {
        return repository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
    }

    public List<JobApplication> getApplicationsByJob(UUID jobId) {
        return repository.findByJobIdOrderByAppliedAtDesc(jobId);
    }
}
