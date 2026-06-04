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

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
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
        return jobRepository.findAllByOrderByCreatedAtDesc();
    }

    public Job getJobById(java.util.UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }
}
