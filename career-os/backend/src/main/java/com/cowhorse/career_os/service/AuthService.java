package com.cowhorse.career_os.service;

import com.cowhorse.career_os.config.SupabaseClient;
import com.cowhorse.career_os.dto.AuthResponse;
import com.cowhorse.career_os.dto.LoginRequest;
import com.cowhorse.career_os.dto.SignupRequest;
import com.cowhorse.career_os.entity.UserProfile;
import com.cowhorse.career_os.repository.UserProfileRepository;
import com.cowhorse.career_os.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final SupabaseClient supabaseClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;
    private final OnboardingService onboardingService;
    private final UserProfileRepository userProfileRepository;

    public AuthResponse login(LoginRequest request) {
        try {
            String url = supabaseClient.getUrl() + "/auth/v1/token?grant_type=password";
            
            Map<String, String> body = new HashMap<>();
            body.put("email", request.getEmail());
            body.put("password", request.getPassword());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseClient.getApiKey());
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            
            log.info("Attempting login for email: {}", request.getEmail());
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                Map<String, Object> userMap = (Map<String, Object>) responseBody.get("user");
                
                if (userMap == null) {
                    log.error("Supabase login response missing user field. Response: {}", responseBody);
                    throw new RuntimeException("Login failed: user field missing from response");
                }
                
                // Extract userId and email from nested user object
                String userId = (String) userMap.get("id");
                String email = (String) userMap.get("email");
                
                // Check if email is verified by looking at email_confirmed_at timestamp or user_metadata.email_verified
                Boolean emailVerified = null;
                String emailConfirmedAt = (String) userMap.get("email_confirmed_at");
                if (emailConfirmedAt != null && !emailConfirmedAt.isEmpty()) {
                    emailVerified = true;
                } else {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> userMetadata = (Map<String, Object>) userMap.get("user_metadata");
                    if (userMetadata != null) {
                        emailVerified = (Boolean) userMetadata.get("email_verified");
                    }
                }
                
                if (userId == null || email == null) {
                    log.error("Supabase login response missing id or email. UserId: {}, Email: {}", userId, email);
                    throw new RuntimeException("Login failed: id or email missing from user data");
                }
                
                // Fetch role from profile
                String role = userProfileRepository.findByUserId(java.util.UUID.fromString(userId))
                        .map(UserProfile::getRole)
                        .orElse("candidate");

                // Generate backend JWT token with Supabase UID and role
                String token = jwtTokenProvider.generateTokenWithSupabaseUid(email, userId, role);
                
                return AuthResponse.builder()
                        .token(token)
                        .email(email)
                        .userId(userId)
                        .role(role)
                        .emailVerified(emailVerified)
                        .build();
            } else {
                log.error("Supabase login failed with status: {}", response.getStatusCode());
                throw new RuntimeException("Login failed");
            }
            
        } catch (RestClientException e) {
            log.error("Supabase login error: {}", e.getMessage());
            String errorMsg = e.getMessage();
            if (errorMsg.contains("email_not_confirmed")) {
                throw new RuntimeException("Email not confirmed. Please check your email and confirm your account before logging in.");
            } else if (errorMsg.contains("Invalid login credentials")) {
                throw new RuntimeException("Login failed: Invalid credentials");
            }
            throw new RuntimeException("Login failed: Invalid credentials");
        } catch (Exception e) {
            log.error("Unexpected error during login: {}", e.getMessage(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    public AuthResponse signup(SignupRequest request) {
        try {
            String url = supabaseClient.getUrl() + "/auth/v1/signup";
            
            Map<String, Object> body = new HashMap<>();
            body.put("email", request.getEmail());
            body.put("password", request.getPassword());
            
            // Optional: Add user metadata (first name, last name)
            Map<String, String> userMetadata = new HashMap<>();
            userMetadata.put("first_name", request.getFirstName());
            userMetadata.put("last_name", request.getLastName());
            body.put("user_metadata", userMetadata);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseClient.getApiKey());
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            
            log.info("Attempting signup for email: {}", request.getEmail());
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                log.info("Supabase signup response: {}", responseBody);
                
                // For signup, Supabase returns the user object directly (not nested under "user" key)
                String userId = (String) responseBody.get("id");
                String email = (String) responseBody.get("email");
                
                // Check if email is verified by looking at email_confirmed_at timestamp or user_metadata.email_verified
                Boolean emailVerified = null;
                String emailConfirmedAt = (String) responseBody.get("email_confirmed_at");
                if (emailConfirmedAt != null && !emailConfirmedAt.isEmpty()) {
                    emailVerified = true;
                } else {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> responseMetadata = (Map<String, Object>) responseBody.get("user_metadata");
                    if (responseMetadata != null) {
                        emailVerified = (Boolean) responseMetadata.get("email_verified");
                    }
                } 

                if (userId == null || email == null) {
                    log.error("Supabase signup response missing id or email. Response: {}", responseBody);
                    throw new RuntimeException("Signup failed: id or email missing from response");
                }
                
                // Initialize user profile and related records
                onboardingService.initializeNewUserProfile(
                        request.getFirstName(),
                        request.getLastName(),
                        userId,
                        "candidate" // Normal signups are always candidates
                );
                
                // Generate backend JWT token with Supabase UID
                String token = jwtTokenProvider.generateTokenWithSupabaseUid(email, userId, "candidate");
                
                return AuthResponse.builder()
                        .token(token)
                        .email(email)
                        .userId(userId)
                        .role("candidate")
                        .emailVerified(emailVerified)
                        .build();
            } else {
                log.error("Supabase signup failed with status: {}", response.getStatusCode());
                throw new RuntimeException("Signup failed");
            }
            
        } catch (RestClientException e) {
            log.error("Supabase signup error: {}", e.getMessage());
            if (e.getMessage().contains("User already registered")) {
                throw new RuntimeException("Email already exists");
            }
            throw new RuntimeException("Signup failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during signup: {}", e.getMessage(), e);
            throw new RuntimeException("Signup failed: " + e.getMessage());
        }
    }
}

