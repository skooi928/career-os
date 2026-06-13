package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.LinkedAccountStatusDTO;
import com.cowhorse.career_os.dto.LoginRequest;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SettingsService settingsService;
    private final JwtTokenProvider jwtTokenProvider;

    private UUID getUidFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isEmpty()) {
            throw new AuthenticationException("Missing Authorization header");
        }
        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("Invalid Authorization header format. Expected 'Bearer <token>'");
        }
        
        String token = authorizationHeader.substring(7);
        try {
            return UUID.fromString(jwtTokenProvider.getUidFromToken(token));
        } catch (Exception e) {
            throw new AuthenticationException("Invalid or expired token: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<LinkedAccountStatusDTO> getStatus(@RequestHeader("Authorization") String authHeader) {
        UUID uid = getUidFromHeader(authHeader);
        return ResponseEntity.ok(settingsService.getLinkedAccountStatus(uid));
    }

    @PostMapping("/link/personal")
    public ResponseEntity<?> linkPersonal(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody LoginRequest request) {
        UUID uid = getUidFromHeader(authHeader);
        try {
            boolean success = settingsService.linkPersonalAccount(uid, request.getEmail(), request.getPassword());
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Successfully linked personal account"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to link personal account"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unlink")
    public ResponseEntity<?> unlink(@RequestHeader("Authorization") String authHeader) {
        UUID uid = getUidFromHeader(authHeader);
        boolean success = settingsService.unlinkAccount(uid);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Successfully unlinked account"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to unlink account"));
        }
    }
}
