package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserId(UUID userId);
    List<Project> findBySupabaseUid(String supabaseUid);
}
