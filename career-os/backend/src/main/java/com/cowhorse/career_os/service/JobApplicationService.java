package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.JobApplication;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    public JobApplication applyForJob(JobApplication application) {
        if (application.getAnswers() != null) {
            for (com.cowhorse.career_os.entity.JobApplicationAnswer answer : application.getAnswers()) {
                answer.setJobApplication(application);
            }
        }
        return repository.save(application);
    }

    public List<JobApplication> getApplicationsByCandidate(UUID candidateId) {
        return repository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
    }

    public List<JobApplication> getApplicationsByJob(UUID jobId) {
        return repository.findByJobIdOrderByAppliedAtDesc(jobId);
    }
}
