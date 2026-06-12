package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.JobApplication;
import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import com.cowhorse.career_os.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final JobRepository jobRepository;
    private final SseService sseService;

    public JobApplicationService(JobApplicationRepository repository, JobRepository jobRepository, SseService sseService) {
        this.repository = repository;
        this.jobRepository = jobRepository;
        this.sseService = sseService;
    }

    public JobApplication applyForJob(JobApplication application) {
        if (application.getAnswers() != null) {
            for (com.cowhorse.career_os.entity.JobApplicationAnswer answer : application.getAnswers()) {
                answer.setJobApplication(application);
            }
        }
        JobApplication savedApp = repository.save(application);

        // Notify employer
        jobRepository.findById(application.getJobId()).ifPresent(job -> {
            sseService.sendEvent(job.getEmployerId(), "NEW_APPLICATION", savedApp);
        });

        return savedApp;
    }

    public List<JobApplication> getApplicationsByCandidate(UUID candidateId) {
        return repository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
    }

    public List<JobApplication> getApplicationsByJob(UUID jobId) {
        return repository.findByJobIdOrderByAppliedAtDesc(jobId);
    }

    public List<JobApplication> getApplicationsByEmployer(UUID employerId) {
        return repository.findApplicationsByEmployerId(employerId);
    }

    public JobApplication updateApplicationStatus(UUID applicationId, String status) {
        return repository.findById(applicationId).map(app -> {
            app.setStatus(status);
            JobApplication updatedApp = repository.save(app);
            
            // Notify candidate
            sseService.sendEvent(updatedApp.getCandidateId(), "APPLICATION_UPDATED", updatedApp);
            
            return updatedApp;
        }).orElse(null);
    }
}
