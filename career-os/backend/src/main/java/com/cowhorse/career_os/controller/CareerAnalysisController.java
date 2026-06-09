package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.CareerAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/career-analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CareerAnalysisController {

    private final CareerAnalysisService careerAnalysisService;
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

    @PostMapping(value = "/analyze", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> analyzeCareer(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) String userId
    ) {
        String uid = (userId != null && !userId.isEmpty()) ? userId : getUidFromHeader(authorizationHeader);
        log.info("Analyzing career path for user: {}", uid);
        String result = careerAnalysisService.analyzeCareer(uid);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/predictions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCareerPredictions(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) String userId
    ) {
        String uid = (userId != null && !userId.isEmpty()) ? userId : getUidFromHeader(authorizationHeader);
        log.info("Retrieving previous career predictions for user: {}", uid);
        String result = careerAnalysisService.getPredictionsForUser(uid);
        return ResponseEntity.ok(result);
    }
}
