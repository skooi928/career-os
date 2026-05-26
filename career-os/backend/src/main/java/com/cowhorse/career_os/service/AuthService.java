package com.cowhorse.career_os.service;

import com.cowhorse.career_os.config.SupabaseClient;
import com.cowhorse.career_os.dto.AuthResponse;
import com.cowhorse.career_os.dto.LoginRequest;
import com.cowhorse.career_os.dto.SignupRequest;
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
                String userId = (String) responseBody.get("user_id");
                @SuppressWarnings("unchecked")
                Map<String, Object> userMap = (Map<String, Object>) responseBody.get("user");
                
                if (userMap == null) {
                    log.error("Supabase login response missing user field. Response: {}", responseBody);
                    throw new RuntimeException("Login failed: user field missing from response");
                }
                
                String email = (String) userMap.get("email");
                Boolean emailVerified = (Boolean) userMap.get("email_confirmed");
                
                if (userId == null || email == null) {
                    log.error("Supabase login response missing id or email. UserId: {}, Email: {}", userId, email);
                    throw new RuntimeException("Login failed: id or email missing from user data");
                }
                
                // Generate backend JWT token with Supabase UID
                String token = jwtTokenProvider.generateTokenWithSupabaseUid(email, userId);
                
                return AuthResponse.builder()
                        .token(token)
                        .email(email)
                        .userId(userId)
                        .emailVerified(emailVerified)
                        .build();
            } else {
                log.error("Supabase login failed with status: {}", response.getStatusCode());
                throw new RuntimeException("Login failed");
            }
            
        } catch (RestClientException e) {
            log.error("Supabase login error: {}", e.getMessage());
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
                Boolean emailVerified = (Boolean) responseBody.get("email_confirmed");
                
                if (userId == null || email == null) {
                    log.error("Supabase signup response missing id or email. Response: {}", responseBody);
                    throw new RuntimeException("Signup failed: id or email missing from response");
                }
                
                // Generate backend JWT token with Supabase UID
                String token = jwtTokenProvider.generateTokenWithSupabaseUid(email, userId);
                
                return AuthResponse.builder()
                        .token(token)
                        .email(email)
                        .userId(userId)
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

