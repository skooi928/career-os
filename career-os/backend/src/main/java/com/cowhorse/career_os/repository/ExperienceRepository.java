package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUserId(UUID userId);
    List<Experience> findBySupabaseUid(String supabaseUid);

    @Transactional
    void deleteByUserId(UUID userId);
}
