package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.LinkedAccountStatusDTO;
import com.cowhorse.career_os.entity.UserProfile;
import com.cowhorse.career_os.repository.UserProfileRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {

    private final UserProfileRepository userProfileRepository;
    private final AuthService authService;

    @PersistenceContext
    private EntityManager entityManager;

    public String getEmailByUserId(UUID userId) {
        try {
            return (String) entityManager.createNativeQuery("SELECT email FROM auth.users WHERE id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("Failed to fetch email for userId: " + userId, e);
            return "";
        }
    }

    public LinkedAccountStatusDTO getLinkedAccountStatus(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null && profile.getLinkedUserId() != null) {
            UserProfile linkedProfile = userProfileRepository.findByUserId(profile.getLinkedUserId()).orElse(null);
            if (linkedProfile != null) {
                String email = getEmailByUserId(profile.getLinkedUserId());
                return LinkedAccountStatusDTO.builder()
                        .linked(true)
                        .linkedEmail(email)
                        .linkedRole(linkedProfile.getRole())
                        .build();
            }
        }
        return LinkedAccountStatusDTO.builder().linked(false).build();
    }

    public boolean linkAccounts(UUID user1, UUID user2) {
        UserProfile p1 = userProfileRepository.findByUserId(user1).orElse(null);
        UserProfile p2 = userProfileRepository.findByUserId(user2).orElse(null);
        if (p1 != null && p2 != null) {
            p1.setLinkedUserId(user2);
            p2.setLinkedUserId(user1);
            userProfileRepository.save(p1);
            userProfileRepository.save(p2);
            log.info("Successfully linked user {} and {}", user1, user2);
            return true;
        }
        return false;
    }

    public boolean unlinkAccount(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null && profile.getLinkedUserId() != null) {
            UserProfile linkedProfile = userProfileRepository.findByUserId(profile.getLinkedUserId()).orElse(null);
            profile.setLinkedUserId(null);
            userProfileRepository.save(profile);
            if (linkedProfile != null) {
                linkedProfile.setLinkedUserId(null);
                userProfileRepository.save(linkedProfile);
            }
            log.info("Successfully unlinked user {}", userId);
            return true;
        }
        return false;
    }

    public boolean linkPersonalAccount(UUID loggedInUserId, String email, String password) {
        try {
            com.cowhorse.career_os.dto.LoginRequest loginReq = new com.cowhorse.career_os.dto.LoginRequest(email, password);
            com.cowhorse.career_os.dto.AuthResponse authResp = authService.login(loginReq);
            if (authResp != null && authResp.getUserId() != null) {
                UUID personalUserId = UUID.fromString(authResp.getUserId());
                if (loggedInUserId.equals(personalUserId)) {
                    throw new RuntimeException("Cannot link an account to itself");
                }
                return linkAccounts(loggedInUserId, personalUserId);
            }
        } catch (Exception e) {
            log.error("Failed to authenticate personal account during linking", e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
        return false;
    }
}
