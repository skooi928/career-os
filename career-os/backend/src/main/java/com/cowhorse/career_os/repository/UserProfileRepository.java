package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(UUID userId);
    Optional<UserProfile> findBySupabaseUid(String supabaseUid);
}
