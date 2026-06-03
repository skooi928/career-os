package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByUserId(UUID userId);
    List<Education> findBySupabaseUid(String supabaseUid);
}
