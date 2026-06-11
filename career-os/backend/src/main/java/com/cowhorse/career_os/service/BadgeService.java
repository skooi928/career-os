package com.cowhorse.career_os.service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cowhorse.career_os.dto.BadgeDTOs.*;
import com.cowhorse.career_os.dto.BadgeDTOs.CreateBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.IssueBadgeRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.ReviewConversionRequest;
import com.cowhorse.career_os.dto.BadgeDTOs.SubmitConversionRequest;
import com.cowhorse.career_os.entity.Badge;
import com.cowhorse.career_os.entity.BadgeVerificationStatus;
import com.cowhorse.career_os.entity.ConversionStatus;
import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.entity.UniversityCourseConversion;
import com.cowhorse.career_os.entity.UserBadge;
import com.cowhorse.career_os.repository.BadgeRepository;
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

    public BadgeService(BadgeRepository badgeRepo,
                        UserBadgeRepository userBadgeRepo,
                        UniversityCourseConversionRepository conversionRepo,
                        OrganisationMemberRepository memberRepo,
                        SupabaseStorageService storageService) {
        this.badgeRepo = badgeRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.conversionRepo = conversionRepo;
        this.memberRepo = memberRepo;
        this.storageService = storageService;
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

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }
}
