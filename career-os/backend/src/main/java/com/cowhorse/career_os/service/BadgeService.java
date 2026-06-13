package com.cowhorse.career_os.service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cowhorse.career_os.dto.BadgeDTOs.CandidateMatchResponse;
import com.cowhorse.career_os.dto.BadgeDTOs.CreateBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.IssueBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.JobRequiredBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.ReviewConversionRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.SubmitConversionRequest;
import com.cowhorse.career_os.entity.Badge;
import com.cowhorse.career_os.entity.BadgeVerificationStatus;
import com.cowhorse.career_os.entity.ConversionStatus;
import com.cowhorse.career_os.entity.JobRequiredBadge;
import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.entity.UniversityCourseConversion;
import com.cowhorse.career_os.entity.UserBadge;
import com.cowhorse.career_os.repository.BadgeRepository;
import com.cowhorse.career_os.repository.JobApplicationRepository;
import com.cowhorse.career_os.repository.JobRequiredBadgeRepository;
import com.cowhorse.career_os.repository.OrganisationMemberRepository;
import com.cowhorse.career_os.repository.UniversityCourseConversionRepository;
import com.cowhorse.career_os.repository.UserBadgeRepository;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final UniversityCourseConversionRepository conversionRepo;
    private final OrganisationMemberRepository memberRepo;
    private final SupabaseStorageService storageService;
    private final JobRequiredBadgeRepository jobRequiredBadgeRepo;
    private final JobApplicationRepository jobApplicationRepo;

    public BadgeService(BadgeRepository badgeRepo,
                        UserBadgeRepository userBadgeRepo,
                        UniversityCourseConversionRepository conversionRepo,
                        OrganisationMemberRepository memberRepo,
                        SupabaseStorageService storageService,
                        JobRequiredBadgeRepository jobRequiredBadgeRepo,
                        JobApplicationRepository jobApplicationRepo) {
        this.badgeRepo = badgeRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.conversionRepo = conversionRepo;
        this.memberRepo = memberRepo;
        this.storageService = storageService;
        this.jobRequiredBadgeRepo = jobRequiredBadgeRepo;
        this.jobApplicationRepo = jobApplicationRepo;
    }

    public List<Badge> getAllBadges() { return badgeRepo.findAll(); }

    public List<Badge> getOrgBadges(UUID orgId) { return badgeRepo.findByOrganisationId(orgId); }

    public Badge getBadgeById(UUID badgeId) {
        return badgeRepo.findById(badgeId).orElseThrow(() -> new RuntimeException("Badge not found"));
    }

    public Badge createBadge(UUID orgId, String userId, CreateBadgeRequest req) {
        assertAdmin(orgId, userId);
        Badge badge = Badge.builder()
                .organisationId(orgId)
                .name(req.getName())
                .description(req.getDescription())
                .skillTag(req.getSkillTag())
                .build();
        return badgeRepo.save(badge);
    }

    public Badge uploadBadgeImage(UUID badgeId, String userId, MultipartFile file) throws IOException {
        Badge badge = badgeRepo.findById(badgeId).orElseThrow();
        assertAdmin(badge.getOrganisationId(), userId);
        String url = storageService.uploadFile(file, "badge-images");
        badge.setBadgeImageUrl(url);
        return badgeRepo.save(badge);
    }

    public void deleteBadge(UUID orgId, UUID badgeId, String userId) {
        assertAdmin(orgId, userId);
        badgeRepo.deleteById(badgeId);
    }

    public UserBadge issueBadge(UUID orgId, String issuerId, IssueBadgeRequest req) {
        assertAdmin(orgId, issuerId);
        UUID targetUserId = UUID.fromString(req.getUserId());
        if (userBadgeRepo.existsByUserIdAndBadgeId(targetUserId, req.getBadgeId())) {
            throw new RuntimeException("User already has this badge");
        }
        UserBadge ub = UserBadge.builder()
                .userId(targetUserId)
                .badgeId(req.getBadgeId())
                .verificationStatus(BadgeVerificationStatus.VERIFIED)
                .build();
        return userBadgeRepo.save(ub);
    }

    public List<UserBadge> getMyBadges(String userId) { return userBadgeRepo.findByUserId(UUID.fromString(userId)); }

    public List<UserBadge> getPublicBadgesForUser(String userId) { return userBadgeRepo.findByUserId(UUID.fromString(userId)); }

    public UniversityCourseConversion submitConversionRequest(String userId, SubmitConversionRequest req) {
        UniversityCourseConversion conversion = UniversityCourseConversion.builder()
                .userId(userId)
                .universityName(req.getUniversityName())
                .courseName(req.getCourseName())
                .mappedBadgeId(req.getMappedBadgeId())
                .build();
        return conversionRepo.save(conversion);
    }

    public String uploadCertificate(String userId, MultipartFile file) throws IOException {
        return storageService.uploadFile(file, "certificates");
    }

    public List<UniversityCourseConversion> getMyConversions(String userId) {
        return conversionRepo.findByUserId(userId);
    }

    public List<UniversityCourseConversion> getPendingConversions() {
        return conversionRepo.findByStatusOrderByCreatedAtDesc(ConversionStatus.PENDING);
    }

    public UniversityCourseConversion reviewConversion(UUID conversionId, String reviewerId, ReviewConversionRequest req) {
        UniversityCourseConversion c = conversionRepo.findById(conversionId).orElseThrow();
        ConversionStatus newStatus = ConversionStatus.valueOf(req.getStatus());
        c.setStatus(newStatus);
        c.setReviewedBy(reviewerId);
        c.setReviewedAt(Instant.now());
        c.setNotes(req.getNotes());
        if (newStatus == ConversionStatus.APPROVED && req.getBadgeId() != null) {
            c.setMappedBadgeId(req.getBadgeId());
            UUID convUserId = UUID.fromString(c.getUserId());
            if (!userBadgeRepo.existsByUserIdAndBadgeId(convUserId, req.getBadgeId())) {
                UserBadge ub = UserBadge.builder()
                        .userId(convUserId)
                        .badgeId(req.getBadgeId())
                        .verificationStatus(BadgeVerificationStatus.VERIFIED)
                        .build();
                userBadgeRepo.save(ub);
            }
        }
        return conversionRepo.save(c);
    }

    /**
     * Set (replace) badge/skill requirements for a job.
     * Only the job's employer can call this (validated by job ownership).
     */
    public List<JobRequiredBadge> setJobBadgeRequirements(UUID jobId, String userId, List<JobRequiredBadgeRequest> requirements) {
        jobRequiredBadgeRepo.deleteByJobId(jobId);
        List<JobRequiredBadge> saved = new ArrayList<>();
        for (JobRequiredBadgeRequest r : requirements) {
            JobRequiredBadge jrb = JobRequiredBadge.builder()
                    .jobId(jobId)
                    .badgeId(r.getBadgeId())
                    .skillTag(r.getSkillTag())
                    .isRequired(r.isRequired())
                    .build();
            saved.add(jobRequiredBadgeRepo.save(jrb));
        }
        return saved;
    }

    public List<JobRequiredBadge> getJobBadgeRequirements(UUID jobId) {
        return jobRequiredBadgeRepo.findByJobId(jobId);
    }

    /**
     * Rank candidates who applied for a job by badge match score.
     * Score = fraction of mandatory badges held * 100.
     */
    public List<CandidateMatchResponse> getCandidateMatchesForJob(UUID jobId, String requesterId) {
        List<JobRequiredBadge> requirements = jobRequiredBadgeRepo.findByJobIdAndIsRequired(jobId, true);
        List<UUID> requiredBadgeIds = requirements.stream()
                .filter(r -> r.getBadgeId() != null)
                .map(JobRequiredBadge::getBadgeId)
                .collect(Collectors.toList());

        // Get all applicants for this job
        return jobApplicationRepo.findByJobIdOrderByAppliedAtDesc(jobId).stream().map(app -> {
            UUID candidateId = app.getCandidateId();
            List<UserBadge> heldBadges = userBadgeRepo.findByUserId(candidateId).stream()
                    .filter(ub -> ub.getVerificationStatus() == BadgeVerificationStatus.VERIFIED)
                    .collect(Collectors.toList());
            List<UUID> heldIds = heldBadges.stream().map(UserBadge::getBadgeId).collect(Collectors.toList());

            List<UUID> matched = requiredBadgeIds.stream().filter(heldIds::contains).collect(Collectors.toList());
            List<UUID> missing = requiredBadgeIds.stream().filter(id -> !heldIds.contains(id)).collect(Collectors.toList());
            int score = requiredBadgeIds.isEmpty() ? 100 : (int)((matched.size() * 100L) / requiredBadgeIds.size());

            return new CandidateMatchResponse(candidateId, candidateId.toString(), score, matched, missing);
        }).sorted((a, b) -> b.getMatchScore() - a.getMatchScore()).collect(Collectors.toList());
    }

    /** Compute match score for a single candidate against a set of required badge IDs. */
    public int computeMatchScore(UUID candidateId, List<UUID> requiredBadgeIds) {
        if (requiredBadgeIds == null || requiredBadgeIds.isEmpty()) return 100;
        List<UserBadge> held = userBadgeRepo.findByUserId(candidateId)
                .stream()
                .filter(ub -> ub.getVerificationStatus() == BadgeVerificationStatus.VERIFIED)
                .toList();
        long heldIds = held.stream()
                .filter(ub -> requiredBadgeIds.contains(ub.getBadgeId()))
                .count();
        return (int) ((heldIds * 100L) / requiredBadgeIds.size());
    }

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (!"APPROVED".equalsIgnoreCase(m.getStatus())) {
            throw new RuntimeException("Organisation membership is pending approval");
        }
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }

    /**
     * Called internally when a learner completes a course that has an attached badge.
     * Awards the badge with VERIFIED status automatically (auto-course-completion = trusted).
     * Idempotent: does nothing if the user already holds the badge from any source.
     *
     * @return the new UserBadge, or null if user already has it or course has no badge
     */
    public UserBadge autoAwardFromCourse(UUID userId, UUID courseId, UUID badgeId) {
        if (userBadgeRepo.existsByUserIdAndBadgeId(userId, badgeId)) {
            return null; // already awarded
        }
        UserBadge ub = UserBadge.builder()
                .userId(userId)
                .badgeId(badgeId)
                .awardedByCourseId(courseId)
                .verificationStatus(BadgeVerificationStatus.VERIFIED)
                .build();
        return userBadgeRepo.save(ub);
    }
}
