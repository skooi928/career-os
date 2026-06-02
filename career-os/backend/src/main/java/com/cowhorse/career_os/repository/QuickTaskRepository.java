package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.QuickTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuickTaskRepository extends JpaRepository<QuickTask, Long> {
    List<QuickTask> findByUserProfileId(Long userProfileId);
}
