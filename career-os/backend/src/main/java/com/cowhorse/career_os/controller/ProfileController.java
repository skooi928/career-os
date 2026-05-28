package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.service.ProfileService;
import com.cowhorse.career_os.service.OnboardingService;
import com.cowhorse.career_os.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {
    private final ProfileService profileService;
    private final OnboardingService onboardingService;
    private final JwtTokenProvider jwtTokenProvider;

    // Helper method to extract Supabase UID from JWT token in Authorization header
    private String getUidFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isEmpty()) {
            throw new AuthenticationException("Missing Authorization header");
        }
        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("Invalid Authorization header format. Expected 'Bearer <token>'");
        }
        
        String token = authorizationHeader.substring(7);
        try {
            return jwtTokenProvider.getUidFromToken(token);
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token: " + e.getMessage());
        }
    }

    // Create profile after Supabase signup
    @PostMapping("/create-profile")
    public ResponseEntity<CreateProfileResponse> createProfile(@RequestBody CreateProfileRequest request) {
        // Initialize user records using OnboardingService
        onboardingService.initializeNewUserProfile(
            request.getFirstName(),
            request.getLastName(),
            request.getUserId(),
            request.getRole()
        );

        // Fetch the newly created profile
        UserProfileDTO profile = profileService.getUserProfileBySupabaseUid(request.getUserId());
        
        // Generate JWT token with Supabase UID for future API calls
        String token = jwtTokenProvider.generateTokenWithSupabaseUid(request.getEmail(), request.getUserId(), request.getRole());
        
        CreateProfileResponse response = CreateProfileResponse.builder()
            .token(token)
            .email(request.getEmail())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .userId(request.getUserId())
            .role(request.getRole())
            .profile(profile)
            .build();
            
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // User Profile Endpoints
    @GetMapping
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) String userId) {
        String uid = (userId != null && !userId.isEmpty()) ? userId : getUidFromHeader(authorizationHeader);
        UserProfileDTO profile = profileService.getUserProfileBySupabaseUid(uid);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody UserProfileDTO profileDTO) {
        String uid = getUidFromHeader(authorizationHeader);
        UserProfileDTO updated = profileService.updateUserProfileBySupabaseUid(uid, profileDTO);
        return ResponseEntity.ok(updated);
    }

    // Experience Endpoints
    @PostMapping("/experience")
    public ResponseEntity<ExperienceDTO> addExperience(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody ExperienceDTO experienceDTO) {
        String uid = getUidFromHeader(authorizationHeader);
        ExperienceDTO saved = profileService.addExperienceBySupabaseUid(uid, experienceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceDTO> updateExperience(
            @PathVariable Long id,
            @RequestBody ExperienceDTO experienceDTO) {
        ExperienceDTO updated = profileService.updateExperience(id, experienceDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        profileService.deleteExperience(id);
        return ResponseEntity.noContent().build();
    }

    // Education Endpoints
    @PostMapping("/education")
    public ResponseEntity<EducationDTO> addEducation(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody EducationDTO educationDTO) {
        String uid = getUidFromHeader(authorizationHeader);
        EducationDTO saved = profileService.addEducationBySupabaseUid(uid, educationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationDTO> updateEducation(
            @PathVariable Long id,
            @RequestBody EducationDTO educationDTO) {
        EducationDTO updated = profileService.updateEducation(id, educationDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        profileService.deleteEducation(id);
        return ResponseEntity.noContent().build();
    }

    // Project Endpoints
    @PostMapping("/project")
    public ResponseEntity<ProjectDTO> addProject(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody ProjectDTO projectDTO) {
        String uid = getUidFromHeader(authorizationHeader);
        ProjectDTO saved = profileService.addProjectBySupabaseUid(uid, projectDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/project/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDTO projectDTO) {
        ProjectDTO updated = profileService.updateProject(id, projectDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/project/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        profileService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // Skill Endpoints
    @PostMapping("/skill")
    public ResponseEntity<SkillDTO> addSkill(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody SkillDTO skillDTO) {
        String uid = getUidFromHeader(authorizationHeader);
        SkillDTO saved = profileService.addSkillBySupabaseUid(uid, skillDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/skill/{id}")
    public ResponseEntity<SkillDTO> updateSkill(
            @PathVariable Long id,
            @RequestBody SkillDTO skillDTO) {
        SkillDTO updated = profileService.updateSkill(id, skillDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/skill/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        profileService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}
