package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, UUID> {
    Optional<InterviewEvaluation> findByAnswerId(UUID answerId);
}
