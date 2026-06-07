package com.cowhorse.career_os.repository;
 
import com.cowhorse.career_os.entity.ResumeCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
 
@Repository
public interface ResumeCertificationRepository extends JpaRepository<ResumeCertification, Long> {
    List<ResumeCertification> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}