package com.cowhorse.career_os.repository;
 
import com.cowhorse.career_os.entity.ResumeReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
 
@Repository
public interface ResumeReferenceRepository extends JpaRepository<ResumeReference, Long> {
    List<ResumeReference> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}