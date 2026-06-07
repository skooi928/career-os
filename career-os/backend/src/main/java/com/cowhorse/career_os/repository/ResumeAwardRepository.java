package com.cowhorse.career_os.repository;
 
import com.cowhorse.career_os.entity.ResumeAward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
 
@Repository
public interface ResumeAwardRepository extends JpaRepository<ResumeAward, Long> {
    List<ResumeAward> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}