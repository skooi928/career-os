package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.Job;
import com.cowhorse.career_os.entity.RoleRequirement;
import com.cowhorse.career_os.entity.RoleTechnicalSkillRequirement;
import com.cowhorse.career_os.entity.RoleMustHaveRequirement;
import com.cowhorse.career_os.repository.JobRepository;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final SseService sseService;
    private final JobApplicationRepository jobApplicationRepository;

    public JobService(JobRepository jobRepository, SseService sseService, JobApplicationRepository jobApplicationRepository) {
        this.jobRepository = jobRepository;
        this.sseService = sseService;
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
        Job savedJob = jobRepository.save(job);
        sseService.broadcastEvent("NEW_JOB_POSTED", savedJob);
        return savedJob;
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

    public List<Job> getJobsByEmployerId(java.util.UUID employerId) {
        return jobRepository.findByEmployerIdOrderByCreatedAtDesc(employerId);
    }

    public Job updateJob(java.util.UUID id, Job updatedJob) {
        Job existingJob = getJobById(id);
        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setCompany(updatedJob.getCompany());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setEmploymentType(updatedJob.getEmploymentType());
        existingJob.setMinSalary(updatedJob.getMinSalary());
        existingJob.setMaxSalary(updatedJob.getMaxSalary());
        existingJob.setDeadline(updatedJob.getDeadline());
        existingJob.setVacancies(updatedJob.getVacancies());
        existingJob.setWebsite(updatedJob.getWebsite());
        // For simplicity, we only update top-level job details, not the nested collections.
        return jobRepository.save(existingJob);
    }
}
