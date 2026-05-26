package com.cowhorse.career_os.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Initialize user profile and related records when a user signs up
     * @param firstName User's first name
     * @param lastName User's last name
     * @param supabaseUid Supabase UID (UUID text) from auth service
     */
    public void initializeNewUserProfile(String firstName, String lastName, String supabaseUid) {
        try {
            log.info("Initializing profile for new user (Supabase UID: {})", supabaseUid);
            
            UUID userUuid = UUID.fromString(supabaseUid);

            // Check if profile already exists to avoid duplicate entries
            String checkSql = "SELECT count(*) FROM dbo.user_profiles WHERE user_id = CAST(? AS uuid)";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userUuid);
            
            if (count != null && count > 0) {
                log.info("Profile already exists for Supabase UID: {}. Skipping initialization.", supabaseUid);
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDate today = LocalDate.now();
            Timestamp timestamp = Timestamp.valueOf(now);

            // Create user profile using native SQL with explicit UUID casting
            String userProfileSql = "INSERT INTO dbo.user_profiles (user_id, supabase_uid, first_name, last_name, created_at, updated_at) " +
                    "VALUES (CAST(? AS uuid), ?, ?, ?, ?, ?)";
            jdbcTemplate.update(userProfileSql, userUuid, supabaseUid, firstName, lastName, timestamp, timestamp);
            log.debug("Created user profile for Supabase UID: {}", supabaseUid);

            // Create placeholder education record
            String educationSql = "INSERT INTO dbo.education (user_id, supabase_uid, degree, institution, field, start_date, is_current, created_at, updated_at) " +
                    "VALUES (CAST(? AS uuid), ?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(educationSql, userUuid, supabaseUid, "", "", "", java.sql.Date.valueOf(today), false, timestamp, timestamp);
            log.debug("Created placeholder education record for Supabase UID: {}", supabaseUid);

            // Create placeholder experience record
            String experienceSql = "INSERT INTO dbo.experience (user_id, supabase_uid, job_title, company, start_date, is_current, created_at, updated_at) " +
                    "VALUES (CAST(? AS uuid), ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(experienceSql, userUuid, supabaseUid, "", "", java.sql.Date.valueOf(today), false, timestamp, timestamp);
            log.debug("Created placeholder experience record for Supabase UID: {}", supabaseUid);

            // Create placeholder project record
            String projectSql = "INSERT INTO dbo.projects (user_id, supabase_uid, title, start_date, created_at, updated_at) " +
                    "VALUES (CAST(? AS uuid), ?, ?, ?, ?, ?)";
            jdbcTemplate.update(projectSql, userUuid, supabaseUid, "", java.sql.Date.valueOf(today), timestamp, timestamp);
            log.debug("Created placeholder project record for Supabase UID: {}", supabaseUid);

            // Create placeholder skill record
            String skillSql = "INSERT INTO dbo.skills (user_id, supabase_uid, name, proficiency, endorsed, created_at, updated_at) " +
                    "VALUES (CAST(? AS uuid), ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(skillSql, userUuid, supabaseUid, "", "BEGINNER", 0, timestamp, timestamp);
            log.debug("Created placeholder skill record for Supabase UID: {}", supabaseUid);

            log.info("Successfully initialized profile for Supabase UID: {}", supabaseUid);
        } catch (Exception e) {
            log.error("Error initializing profile for Supabase UID: {}", supabaseUid, e);
            throw new RuntimeException("Failed to initialize user profile: " + e.getMessage(), e);
        }
    }
}
