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

    @org.springframework.data.jpa.repository.Query("SELECT a FROM JobApplication a JOIN Job j ON a.jobId = j.id WHERE j.employerId = :employerId ORDER BY a.appliedAt DESC")
    List<JobApplication> findApplicationsByEmployerId(@org.springframework.data.repository.query.Param("employerId") UUID employerId);
}
