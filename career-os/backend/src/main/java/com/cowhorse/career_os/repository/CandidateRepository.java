package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUserId(UUID userId);

    @Transactional
    void deleteByUserId(UUID userId);
}
