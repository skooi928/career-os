package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.FairPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/fair-pay")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FairPayController {

    private final FairPayService fairPayService;
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
    public ResponseEntity<String> analyze(
            @RequestHeader(value = "Authorization") String authorizationHeader,
            @RequestParam String jobTitle,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType
    ) {
        String uid = getUidFromHeader(authorizationHeader);
        log.info("Fair pay analysis requested by uid={} for jobTitle={}", uid, jobTitle);
        String result = fairPayService.analyze(uid, jobTitle, location, employmentType);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getHistory(
            @RequestHeader(value = "Authorization") String authorizationHeader
    ) {
        String uid = getUidFromHeader(authorizationHeader);
        String result = fairPayService.getHistory(uid);
        return ResponseEntity.ok(result);
    }
}
