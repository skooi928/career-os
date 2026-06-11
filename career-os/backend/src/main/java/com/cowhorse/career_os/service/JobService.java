package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.RoleRequirement;
import com.cowhorse.career_os.entity.RoleTechnicalSkillRequirement;
import com.cowhorse.career_os.entity.RoleMustHaveRequirement;
import com.cowhorse.career_os.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final com.cowhorse.career_os.repository.JobApplicationRepository jobApplicationRepository;

    public JobService(JobRepository jobRepository, 
                      com.cowhorse.career_os.repository.JobApplicationRepository jobApplicationRepository) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public Job createJob(Job job) {
        if (job.getRoleRequirements() != null) {
            for (RoleRequirement req : job.getRoleRequirements()) {
                req.setJob(job);
                if (req.getTechnicalSkills() != null) {
                    for (RoleTechnicalSkillRequirement skill : req.getTechnicalSkills()) {
                        skill.setRoleRequirement(req);
                    }
                }
                if (req.getMustHaveRequirements() != null) {
                    for (RoleMustHaveRequirement mustHave : req.getMustHaveRequirements()) {
                        mustHave.setRoleRequirement(req);
                    }
                }
            }
        }
        if (job.getQuestions() != null) {
            for (com.cowhorse.career_os.entity.JobQuestion question : job.getQuestions()) {
                question.setJob(job);
            }
        }
        if (job.getBenefits() != null) {
            for (com.cowhorse.career_os.entity.JobBenefit benefit : job.getBenefits()) {
                benefit.setJob(job);
            }
        }
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        List<Job> jobs = jobRepository.findAllByOrderByCreatedAtDesc();
        for (Job job : jobs) {
            long count = jobApplicationRepository.countByJobId(job.getId());
            job.setApplicantsCount(count);
        }
        return jobs;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Job getJobById(java.util.UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        
        if (job.getRoleRequirements() != null) {
            job.getRoleRequirements().size();
            for (com.cowhorse.career_os.entity.RoleRequirement req : job.getRoleRequirements()) {
                if (req.getTechnicalSkills() != null) {
                    req.getTechnicalSkills().size();
                }
                if (req.getMustHaveRequirements() != null) {
                    req.getMustHaveRequirements().size();
                }
            }
        }
        if (job.getQuestions() != null) {
            job.getQuestions().size();
        }
        if (job.getBenefits() != null) {
            job.getBenefits().size();
        }
        
        long count = jobApplicationRepository.countByJobId(job.getId());
        job.setApplicantsCount(count);
        
        return job;
    }
}
