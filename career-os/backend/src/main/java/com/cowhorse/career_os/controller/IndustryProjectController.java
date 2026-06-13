package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.IndustryProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/industry-projects")
@RequiredArgsConstructor
public class IndustryProjectController {

    private final IndustryProjectService projectService;
    private final JwtTokenProvider jwtTokenProvider;

    private String getUid(String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(auth.substring(7));
    }

    // ── Public browse ──────────────────────────────────────────────────────────

    @GetMapping("/public")
    public ResponseEntity<List<IndustryProject>> getOpenProjects() {
        return ResponseEntity.ok(projectService.getOpenProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IndustryProject> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping("/{id}/required-badges")
    public ResponseEntity<List<ProjectRequiredBadge>> getRequiredBadges(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getRequiredBadges(id));
    }

    @GetMapping("/{id}/eligibility")
    public ResponseEntity<IndustryProjectService.EligibilityResult> checkEligibility(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.checkEligibility(id, getUid(auth)));
    }

    // ── Org management ─────────────────────────────────────────────────────────

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<IndustryProject>> getOrgProjects(
            @PathVariable UUID orgId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.getOrgProjects(orgId, getUid(auth)));
    }

    @PostMapping("/org/{orgId}")
    public ResponseEntity<IndustryProject> createProject(
            @PathVariable UUID orgId,
            @RequestHeader("Authorization") String auth,
            @RequestBody IndustryProjectService.CreateProjectRequest req) {
        return ResponseEntity.ok(projectService.createProject(orgId, getUid(auth), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IndustryProject> updateProject(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth,
            @RequestBody IndustryProjectService.CreateProjectRequest req) {
        return ResponseEntity.ok(projectService.updateProject(id, getUid(auth), req));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<IndustryProject> publishProject(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.publishProject(id, getUid(auth)));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<IndustryProject> closeProject(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.closeProject(id, getUid(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        projectService.deleteProject(id, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/required-badges/{badgeId}")
    public ResponseEntity<ProjectRequiredBadge> addRequiredBadge(
            @PathVariable UUID id,
            @PathVariable UUID badgeId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.addRequiredBadge(id, badgeId, getUid(auth)));
    }

    @DeleteMapping("/{id}/required-badges/{badgeId}")
    public ResponseEntity<Void> removeRequiredBadge(
            @PathVariable UUID id,
            @PathVariable UUID badgeId,
            @RequestHeader("Authorization") String auth) {
        projectService.removeRequiredBadge(id, badgeId, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    // ── Applications ───────────────────────────────────────────────────────────

    @PostMapping("/{id}/apply")
    public ResponseEntity<ProjectApplication> apply(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.applyToProject(id, getUid(auth)));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<ProjectApplication>> getApplications(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.getProjectApplications(id, getUid(auth)));
    }

    @GetMapping("/my/applications")
    public ResponseEntity<List<ProjectApplication>> getMyApplications(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(projectService.getMyApplications(getUid(auth)));
    }

    @PatchMapping("/applications/{appId}/review")
    public ResponseEntity<ProjectApplication> reviewApplication(
            @PathVariable UUID appId,
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.reviewApplication(appId, body.get("status"), getUid(auth)));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<Void> withdraw(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        projectService.withdrawApplication(id, getUid(auth));
        return ResponseEntity.noContent().build();
    }
}
