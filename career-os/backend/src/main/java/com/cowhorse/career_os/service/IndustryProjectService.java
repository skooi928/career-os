package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IndustryProjectService {

    private final IndustryProjectRepository projectRepo;
    private final ProjectRequiredBadgeRepository reqBadgeRepo;
    private final ProjectApplicationRepository appRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final BadgeRepository badgeRepo;
    private final CourseRepository courseRepo;
    private final OrganisationMemberRepository memberRepo;

    // ── Public browse ──────────────────────────────────────────────────────────

    public List<IndustryProject> getOpenProjects() {
        return projectRepo.findByStatus(ProjectStatus.OPEN);
    }

    public IndustryProject getProject(UUID id) {
        return projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public List<ProjectRequiredBadge> getRequiredBadges(UUID projectId) {
        return reqBadgeRepo.findByProjectId(projectId);
    }

    // ── Eligibility ────────────────────────────────────────────────────────────

    public EligibilityResult checkEligibility(UUID projectId, String userId) {
        UUID uid = UUID.fromString(userId);
        List<ProjectRequiredBadge> required = reqBadgeRepo.findByProjectId(projectId);
        if (required.isEmpty()) return new EligibilityResult(true, List.of(), List.of());

        Set<UUID> earned = userBadgeRepo.findByUserId(uid).stream()
                .map(UserBadge::getBadgeId).collect(Collectors.toSet());

        List<Badge> missing = required.stream()
                .filter(r -> !earned.contains(r.getBadgeId()))
                .map(r -> badgeRepo.findById(r.getBadgeId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Course> recommended = missing.stream()
                .flatMap(b -> courseRepo.findByBadgeIdAndIsPublishedTrue(b.getId()).stream())
                .distinct()
                .collect(Collectors.toList());

        return new EligibilityResult(missing.isEmpty(), missing, recommended);
    }

    public record EligibilityResult(boolean eligible, List<Badge> missingBadges, List<Course> recommendedCourses) {}

    // ── Org management ─────────────────────────────────────────────────────────

    public List<IndustryProject> getOrgProjects(UUID orgId, String userId) {
        assertMember(orgId, userId);
        return projectRepo.findByOrganisationId(orgId);
    }

    @Transactional
    public IndustryProject createProject(UUID orgId, String userId, CreateProjectRequest req) {
        assertMember(orgId, userId);
        IndustryProject p = IndustryProject.builder()
                .organisationId(orgId)
                .title(req.title())
                .description(req.description())
                .skillsRequired(req.skillsRequired())
                .maxCandidates(req.maxCandidates() != null ? req.maxCandidates() : 5)
                .deadline(req.deadline() != null ? java.time.LocalDate.parse(req.deadline()) : null)
                .build();
        return projectRepo.save(p);
    }

    @Transactional
    public IndustryProject updateProject(UUID projectId, String userId, CreateProjectRequest req) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        p.setTitle(req.title());
        p.setDescription(req.description());
        p.setSkillsRequired(req.skillsRequired());
        if (req.maxCandidates() != null) p.setMaxCandidates(req.maxCandidates());
        if (req.deadline() != null) p.setDeadline(java.time.LocalDate.parse(req.deadline()));
        p.setUpdatedAt(Instant.now());
        return projectRepo.save(p);
    }

    @Transactional
    public IndustryProject publishProject(UUID projectId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        p.setStatus(ProjectStatus.OPEN);
        p.setUpdatedAt(Instant.now());
        return projectRepo.save(p);
    }

    @Transactional
    public IndustryProject closeProject(UUID projectId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        p.setStatus(ProjectStatus.CLOSED);
        p.setUpdatedAt(Instant.now());
        return projectRepo.save(p);
    }

    @Transactional
    public void deleteProject(UUID projectId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        projectRepo.deleteById(projectId);
    }

    @Transactional
    public ProjectRequiredBadge addRequiredBadge(UUID projectId, UUID badgeId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        if (reqBadgeRepo.existsByProjectIdAndBadgeId(projectId, badgeId)) {
            return reqBadgeRepo.findByProjectId(projectId).stream()
                    .filter(r -> r.getBadgeId().equals(badgeId)).findFirst().orElseThrow();
        }
        return reqBadgeRepo.save(ProjectRequiredBadge.builder().projectId(projectId).badgeId(badgeId).build());
    }

    @Transactional
    public void removeRequiredBadge(UUID projectId, UUID badgeId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        reqBadgeRepo.deleteByProjectIdAndBadgeId(projectId, badgeId);
    }

    // ── Applications ───────────────────────────────────────────────────────────

    @Transactional
    public ProjectApplication applyToProject(UUID projectId, String userId) {
        UUID uid = UUID.fromString(userId);
        IndustryProject p = getProject(projectId);
        if (p.getStatus() != ProjectStatus.OPEN) throw new RuntimeException("Project not open for applications");
        if (appRepo.existsByProjectIdAndUserId(projectId, uid)) throw new RuntimeException("Already applied");

        EligibilityResult el = checkEligibility(projectId, userId);
        if (!el.eligible()) throw new RuntimeException("Missing required badges");

        return appRepo.save(ProjectApplication.builder().projectId(projectId).userId(uid).build());
    }

    public List<ProjectApplication> getProjectApplications(UUID projectId, String userId) {
        IndustryProject p = getProject(projectId);
        assertMember(p.getOrganisationId(), userId);
        return appRepo.findByProjectId(projectId);
    }

    public List<ProjectApplication> getMyApplications(String userId) {
        return appRepo.findByUserId(UUID.fromString(userId));
    }

    @Transactional
    public ProjectApplication reviewApplication(UUID appId, String status, String userId) {
        ProjectApplication app = appRepo.findById(appId).orElseThrow(() -> new RuntimeException("Application not found"));
        IndustryProject p = getProject(app.getProjectId());
        assertMember(p.getOrganisationId(), userId);
        app.setStatus(ProjectApplicationStatus.valueOf(status.toUpperCase()));
        app.setReviewedAt(Instant.now());
        return appRepo.save(app);
    }

    @Transactional
    public void withdrawApplication(UUID projectId, String userId) {
        UUID uid = UUID.fromString(userId);
        ProjectApplication app = appRepo.findByProjectIdAndUserId(projectId, uid)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(ProjectApplicationStatus.WITHDRAWN);
        appRepo.save(app);
    }

    // ── DTOs ───────────────────────────────────────────────────────────────────

    public record CreateProjectRequest(String title, String description, String skillsRequired,
                                       Integer maxCandidates, String deadline) {}

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void assertMember(UUID orgId, String userId) {
        if (!memberRepo.existsByOrganisationIdAndUserId(orgId, UUID.fromString(userId)))
            throw new RuntimeException("Not a member of this organisation");
    }
}
