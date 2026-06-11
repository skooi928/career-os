package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByCandidateIdOrderByAppliedAtDesc(UUID candidateId);
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(UUID jobId);
    long countByJobId(UUID jobId);
}
