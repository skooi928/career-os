package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.DashboardSummaryDTO;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final JwtTokenProvider jwtTokenProvider;

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

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) String userId) {
        
        String uid = (userId != null && !userId.isEmpty()) ? userId : getUidFromHeader(authorizationHeader);
        UUID userUuid = UUID.fromString(uid);
        
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userUuid);
        return ResponseEntity.ok(summary);
    }
}
