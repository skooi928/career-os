package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUserId(Long userId);
    List<Experience> findBySupabaseUid(String supabaseUid);
}
