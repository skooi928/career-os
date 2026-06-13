package com.cowhorse.career_os.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cowhorse.career_os.entity.JobRequiredBadge;

public interface JobRequiredBadgeRepository extends JpaRepository<JobRequiredBadge, UUID> {

    List<JobRequiredBadge> findByJobId(UUID jobId);

    List<JobRequiredBadge> findByJobIdAndIsRequired(UUID jobId, boolean isRequired);

    /**
     * Find all jobs that require (or prefer) a specific badge.
     */
    List<JobRequiredBadge> findByBadgeId(UUID badgeId);

    /**
     * Find all jobs that require a specific skill tag (case-insensitive).
     */
    @Query("SELECT r FROM JobRequiredBadge r WHERE LOWER(r.skillTag) = LOWER(:tag)")
    List<JobRequiredBadge> findBySkillTagIgnoreCase(@Param("tag") String tag);

    void deleteByJobId(UUID jobId);
}
