package com.cowhorse.career_os.repository;
 
import com.cowhorse.career_os.entity.ResumeLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
 
@Repository
public interface ResumeLanguageRepository extends JpaRepository<ResumeLanguage, Long> {
    List<ResumeLanguage> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}