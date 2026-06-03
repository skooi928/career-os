package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUserId(UUID userId);
    List<Skill> findBySupabaseUid(String supabaseUid);
}
