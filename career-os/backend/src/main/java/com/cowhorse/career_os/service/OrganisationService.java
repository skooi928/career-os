package com.cowhorse.career_os.service;

import com.cowhorse.career_os.dto.OrganisationDTOs.*;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class OrganisationService {

    private final OrganisationRepository orgRepo;
    private final OrganisationMemberRepository memberRepo;
    private final CourseRepository courseRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final UniversityCourseConversionRepository conversionRepo;
    private final SupabaseStorageService storageService;

    public OrganisationService(OrganisationRepository orgRepo,
                               OrganisationMemberRepository memberRepo,
                               CourseRepository courseRepo,
                               UserBadgeRepository userBadgeRepo,
                               UniversityCourseConversionRepository conversionRepo,
                               SupabaseStorageService storageService) {
        this.orgRepo = orgRepo;
        this.memberRepo = memberRepo;
        this.courseRepo = courseRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.conversionRepo = conversionRepo;
        this.storageService = storageService;
    }

    public List<Organisation> getVerifiedOrganisations() {
        return orgRepo.findByVerificationStatus(VerificationStatus.VERIFIED);
    }

    public Organisation getOrganisationById(UUID id) {
        return orgRepo.findById(id).orElseThrow(() -> new RuntimeException("Organisation not found"));
    }

    public List<Organisation> getMyOrganisations(String userId) {
        List<OrganisationMember> memberships = memberRepo.findByUserId(userId);
        return memberships.stream()
                .map(m -> orgRepo.findById(m.getOrganisationId()).orElse(null))
                .filter(o -> o != null)
                .toList();
    }

    public Organisation createOrganisation(String userId, CreateOrganisationRequest req) {
        Organisation org = Organisation.builder()
                .name(req.getName())
                .type(req.getType())
                .website(req.getWebsite())
                .description(req.getDescription())
                .emailDomain(req.getEmailDomain())
                .build();
        org = orgRepo.save(org);
        OrganisationMember adminMember = OrganisationMember.builder()
                .organisationId(org.getId())
                .userId(userId)
                .role(OrgMemberRole.ORG_ADMIN)
                .invitedBy(userId)
                .build();
        memberRepo.save(adminMember);
        return org;
    }

    public Organisation updateOrganisation(UUID orgId, String userId, UpdateOrganisationRequest req) {
        assertAdmin(orgId, userId);
        Organisation org = orgRepo.findById(orgId).orElseThrow();
        if (req.getName() != null) org.setName(req.getName());
        if (req.getWebsite() != null) org.setWebsite(req.getWebsite());
        if (req.getDescription() != null) org.setDescription(req.getDescription());
        if (req.getEmailDomain() != null) org.setEmailDomain(req.getEmailDomain());
        return orgRepo.save(org);
    }

    public Organisation uploadVerificationDocument(UUID orgId, String userId, MultipartFile file) throws IOException {
        assertMember(orgId, userId);
        String url = storageService.uploadFile(file, "org-documents");
        Organisation org = orgRepo.findById(orgId).orElseThrow();
        org.setVerificationDocumentUrl(url);
        return orgRepo.save(org);
    }

    public Organisation uploadLogo(UUID orgId, String userId, MultipartFile file) throws IOException {
        assertMember(orgId, userId);
        String url = storageService.uploadFile(file, "org-logos");
        Organisation org = orgRepo.findById(orgId).orElseThrow();
        org.setLogoUrl(url);
        return orgRepo.save(org);
    }

    public List<OrganisationMember> getMembers(UUID orgId, String userId) {
        assertMember(orgId, userId);
        return memberRepo.findByOrganisationId(orgId);
    }

    public OrganisationMember inviteMember(UUID orgId, String inviterId, InviteMemberRequest req) {
        assertAdmin(orgId, inviterId);
        OrganisationMember member = OrganisationMember.builder()
                .organisationId(orgId)
                .userId(req.getEmail())
                .role(req.getRole() != null ? req.getRole() : OrgMemberRole.MENTOR)
                .invitedBy(inviterId)
                .build();
        return memberRepo.save(member);
    }

    public OrganisationMember updateMemberRole(UUID orgId, UUID memberId, String requesterId, UpdateMemberRoleRequest req) {
        assertAdmin(orgId, requesterId);
        OrganisationMember member = memberRepo.findById(memberId).orElseThrow();
        member.setRole(req.getRole());
        return memberRepo.save(member);
    }

    public void removeMember(UUID orgId, UUID memberId, String requesterId) {
        assertAdmin(orgId, requesterId);
        memberRepo.deleteById(memberId);
    }

    public DashboardStatsResponse getDashboardStats(UUID orgId, String userId) {
        assertMember(orgId, userId);
        long publishedCourses = courseRepo.countByOrganisationIdAndIsPublishedTrue(orgId);
        List<UUID> courseIds = courseRepo.findByOrganisationId(orgId).stream().map(c -> c.getId()).toList();
        long totalEnrollments = courseIds.stream().mapToLong(cId -> 0L).sum(); // placeholder – full impl uses enrollment repo
        long pendingVerifications = conversionRepo.countByStatus(ConversionStatus.PENDING);
        long totalBadgesIssued = 0L;
        return new DashboardStatsResponse(publishedCourses, totalEnrollments, totalBadgesIssued, pendingVerifications);
    }

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this organisation"));
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }

    private void assertMember(UUID orgId, String userId) {
        if (!memberRepo.existsByOrganisationIdAndUserId(orgId, userId))
            throw new RuntimeException("Not a member of this organisation");
    }
}
