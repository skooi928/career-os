package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.SavedJob;
import com.cowhorse.career_os.repository.SavedJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;

    public SavedJobService(SavedJobRepository savedJobRepository) {
        this.savedJobRepository = savedJobRepository;
    }

    public SavedJob saveJob(UUID userId, UUID jobId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return savedJobRepository.findByUserIdAndJobId(userId, jobId).get();
        }
        SavedJob savedJob = SavedJob.builder()
                .userId(userId)
                .jobId(jobId)
                .build();
        return savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(UUID userId, UUID jobId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    public List<SavedJob> getSavedJobsForUser(UUID userId) {
        return savedJobRepository.findByUserId(userId);
    }

    public boolean isJobSaved(UUID userId, UUID jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }
}
