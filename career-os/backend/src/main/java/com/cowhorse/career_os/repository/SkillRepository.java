package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUserId(Long userId);
    List<Skill> findBySupabaseUid(String supabaseUid);
}
