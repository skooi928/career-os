package com.cowhorse.career_os.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cowhorse.career_os.dto.BadgeDTOs.*;
import com.cowhorse.career_os.dto.BadgeDTOs.CreateBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.FileUploadResponse;
import com.cowhorse.career_os.dto.BadgeDTOs.IssueBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.ReviewConversionRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.SubmitConversionRequest;
import com.cowhorse.career_os.entity.Badge;
import com.cowhorse.career_os.entity.UniversityCourseConversion;
import com.cowhorse.career_os.entity.UserBadge;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.BadgeService;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class BadgeController {

    private final BadgeService badgeService;
    private final JwtTokenProvider jwtTokenProvider;

    public BadgeController(BadgeService badgeService, JwtTokenProvider jwtTokenProvider) {
        this.badgeService = badgeService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String getUid(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(authHeader.substring(7));
    }

    @GetMapping
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<Badge>> getOrgBadges(@PathVariable UUID orgId) {
        return ResponseEntity.ok(badgeService.getOrgBadges(orgId));
    }

    @GetMapping("/{badgeId}")
    public ResponseEntity<Badge> getBadgeById(@PathVariable UUID badgeId) {
        return ResponseEntity.ok(badgeService.getBadgeById(badgeId));
    }

    @PostMapping("/org/{orgId}")
    public ResponseEntity<Badge> createBadge(@PathVariable UUID orgId,
                                              @RequestHeader("Authorization") String auth,
                                              @RequestBody CreateBadgeRequest req) {
        return ResponseEntity.ok(badgeService.createBadge(orgId, getUid(auth), req));
    }

    @PostMapping("/{badgeId}/upload-image")
    public ResponseEntity<Badge> uploadBadgeImage(@PathVariable UUID badgeId,
                                                   @RequestHeader("Authorization") String auth,
                                                   @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(badgeService.uploadBadgeImage(badgeId, getUid(auth), file));
    }

    @DeleteMapping("/org/{orgId}/{badgeId}")
    public ResponseEntity<Void> deleteBadge(@PathVariable UUID orgId,
                                             @PathVariable UUID badgeId,
                                             @RequestHeader("Authorization") String auth) {
        badgeService.deleteBadge(orgId, badgeId, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/org/{orgId}/issue")
    public ResponseEntity<UserBadge> issueBadge(@PathVariable UUID orgId,
                                                 @RequestHeader("Authorization") String auth,
                                                 @RequestBody IssueBadgeRequest req) {
        return ResponseEntity.ok(badgeService.issueBadge(orgId, getUid(auth), req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<UserBadge>> getMyBadges(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(badgeService.getMyBadges(getUid(auth)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserBadge>> getPublicBadgesForUser(@PathVariable String userId) {
        return ResponseEntity.ok(badgeService.getPublicBadgesForUser(userId));
    }

    @PostMapping("/conversions")
    public ResponseEntity<UniversityCourseConversion> submitConversion(@RequestHeader("Authorization") String auth,
                                                                        @RequestBody SubmitConversionRequest req) {
        return ResponseEntity.ok(badgeService.submitConversionRequest(getUid(auth), req));
    }

    @PostMapping("/conversions/upload-certificate")
    public ResponseEntity<FileUploadResponse> uploadCertificate(@RequestHeader("Authorization") String auth,
                                                                 @RequestParam("file") MultipartFile file) throws IOException {
        String url = badgeService.uploadCertificate(getUid(auth), file);
        return ResponseEntity.ok(new FileUploadResponse(url));
    }

    @GetMapping("/conversions/my")
    public ResponseEntity<List<UniversityCourseConversion>> getMyConversions(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(badgeService.getMyConversions(getUid(auth)));
    }

    @GetMapping("/conversions/pending")
    public ResponseEntity<List<UniversityCourseConversion>> getPendingConversions(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(badgeService.getPendingConversions());
    }

    @PutMapping("/conversions/{conversionId}/review")
    public ResponseEntity<UniversityCourseConversion> reviewConversion(@PathVariable UUID conversionId,
                                                                        @RequestHeader("Authorization") String auth,
                                                                        @RequestBody ReviewConversionRequest req) {
        return ResponseEntity.ok(badgeService.reviewConversion(conversionId, getUid(auth), req));
    }
}
