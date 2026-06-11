package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    List<SavedJob> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SavedJob> findByUserIdAndJobId(UUID userId, UUID jobId);
    void deleteByUserIdAndJobId(UUID userId, UUID jobId);
}
