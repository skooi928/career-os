package com.cowhorse.career_os.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.cowhorse.career_os.service.OnboardingService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class SupabaseAuthController {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final OnboardingService onboardingService;

    @Autowired
    public SupabaseAuthController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping("/azure")
    public void authorizeAzure(HttpServletResponse response) throws IOException {
        try {
            // Generate PKCE Code Verifier
            SecureRandom sr = new SecureRandom();
            byte[] code = new byte[32];
            sr.nextBytes(code);
            String codeVerifier = Base64.getUrlEncoder().withoutPadding().encodeToString(code);

            // Generate PKCE Code Challenge
            byte[] bytes = codeVerifier.getBytes(StandardCharsets.US_ASCII);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(bytes, 0, bytes.length);
            byte[] digest = md.digest();
            String codeChallenge = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);

            // Store code verifier in a secure HTTP-only cookie
            Cookie cookie = new Cookie("pkce_verifier", codeVerifier);
            cookie.setHttpOnly(true);
            cookie.setPath("/api/auth/callback");
            cookie.setMaxAge(300); // 5 minutes
            response.addCookie(cookie);

            String redirectUri = "http://localhost:8080/api/auth/callback";
            
            // Supabase Authorize URL
            String authUrl = supabaseUrl + "/auth/v1/authorize?provider=azure" +
                             "&redirect_to=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                             "&code_challenge=" + codeChallenge +
                             "&code_challenge_method=s256" +
                             "&scopes=" + URLEncoder.encode("email offline_access", StandardCharsets.UTF_8);

            response.sendRedirect(authUrl);
        } catch (NoSuchAlgorithmException e) {
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to generate PKCE challenge");
        }
    }

    @GetMapping("/callback")
    public void handleCallback(
            HttpServletRequest request,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String error_description,
            HttpServletResponse response) throws IOException {

        String frontendCallbackUrl = "http://localhost:4200/auth-callback";
        String frontendLoginUrl = "http://localhost:4200/login";

        if (error != null) {
            response.sendRedirect(frontendLoginUrl + "?error=" + URLEncoder.encode(error_description != null ? error_description : error, StandardCharsets.UTF_8));
            return;
        }

        if (code == null || code.isEmpty()) {
            response.sendRedirect(frontendLoginUrl + "?error=" + URLEncoder.encode("No authorization code provided", StandardCharsets.UTF_8));
            return;
        }

        // Retrieve code verifier from cookie
        String codeVerifier = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("pkce_verifier".equals(cookie.getName())) {
                    codeVerifier = cookie.getValue();
                    break;
                }
            }
        }

        if (codeVerifier == null) {
            response.sendRedirect(frontendLoginUrl + "?error=" + URLEncoder.encode("Session expired or invalid PKCE state (Cookie missing)", StandardCharsets.UTF_8));
            return;
        }

        try {
            // Exchange code for token
            String tokenUrl = supabaseUrl + "/auth/v1/token?grant_type=pkce";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseAnonKey);

            String requestBody = String.format("{\"auth_code\":\"%s\", \"code_verifier\":\"%s\"}", code, codeVerifier);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, entity, Map.class);
            Map<String, Object> body = tokenResponse.getBody();

            if (tokenResponse.getStatusCode() == HttpStatus.OK && body != null && body.containsKey("access_token")) {
                String accessToken = (String) body.get("access_token");
                
                // Extract user details to initialize profile if it's their first time logging in
                try {
                    Map<String, Object> userObj = (Map<String, Object>) body.get("user");
                    if (userObj != null && userObj.containsKey("id")) {
                        String uid = (String) userObj.get("id");
                        Map<String, Object> metadata = (Map<String, Object>) userObj.get("user_metadata");
                        String firstName = "User";
                        String lastName = "";
                        if (metadata != null) {
                            String fullName = (String) metadata.get("full_name");
                            String name = (String) metadata.get("name"); // Some providers use 'name'
                            String displayName = fullName != null ? fullName : name;
                            if (displayName != null) {
                                String[] parts = displayName.split(" ", 2);
                                firstName = parts[0];
                                if (parts.length > 1) lastName = parts[1];
                            }
                        }
                        onboardingService.initializeNewUserProfile(firstName, lastName, uid);
                    }
                } catch (Exception ex) {
                    System.err.println("Error extracting user data for onboarding: " + ex.getMessage());
                }
                
                // Clear the cookie
                Cookie clearCookie = new Cookie("pkce_verifier", null);
                clearCookie.setMaxAge(0);
                clearCookie.setPath("/api/auth/callback");
                response.addCookie(clearCookie);

                // Redirect back to frontend with the token
                response.sendRedirect(frontendCallbackUrl + "?token=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8));
            } else {
                response.sendRedirect(frontendLoginUrl + "?error=" + URLEncoder.encode("Failed to obtain access token", StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            response.sendRedirect(frontendLoginUrl + "?error=" + URLEncoder.encode("Exception during token exchange: " + e.getMessage(), StandardCharsets.UTF_8));
        }
    }
}
