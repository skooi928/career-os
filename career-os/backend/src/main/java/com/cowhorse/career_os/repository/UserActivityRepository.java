package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.UserActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, UUID> {
    List<UserActivity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<UserActivity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
