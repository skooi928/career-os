package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.ActualInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActualInterviewRepository extends JpaRepository<ActualInterview, UUID> {
    List<ActualInterview> findByCandidateIdOrderByScheduledAtDesc(UUID candidateId);
}
