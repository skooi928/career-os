package com.cowhorse.career_os.service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cowhorse.career_os.dto.OrganisationDTOs.CreateOrganisationRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.DashboardStatsResponse;
import com.cowhorse.career_os.dto.OrganisationDTOs.InviteMemberRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.UpdateMemberRoleRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.UpdateOrganisationRequest;
import com.cowhorse.career_os.entity.ConversionStatus;
import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.Organisation;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.entity.VerificationStatus;
import com.cowhorse.career_os.exception.DuplicateOrganisationNameException;
import com.cowhorse.career_os.repository.CourseEnrollmentRepository;
import com.cowhorse.career_os.repository.CourseRepository;
import com.cowhorse.career_os.repository.OrganisationMemberRepository;
import com.cowhorse.career_os.repository.OrganisationRepository;
import com.cowhorse.career_os.repository.UniversityCourseConversionRepository;
import com.cowhorse.career_os.repository.UserBadgeRepository;
import com.cowhorse.career_os.repository.UserProfileRepository;

@Service
public class OrganisationService {

    private final OrganisationRepository orgRepo;
    private final OrganisationMemberRepository memberRepo;
    private final CourseRepository courseRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final UniversityCourseConversionRepository conversionRepo;
    private final SupabaseStorageService storageService;
    private final UserProfileRepository userProfileRepo;

    public OrganisationService(OrganisationRepository orgRepo,
                               OrganisationMemberRepository memberRepo,
                               CourseRepository courseRepo,
                               CourseEnrollmentRepository enrollmentRepo,
                               UserBadgeRepository userBadgeRepo,
                               UniversityCourseConversionRepository conversionRepo,
                               SupabaseStorageService storageService,
                               UserProfileRepository userProfileRepo) {
        this.orgRepo = orgRepo;
        this.memberRepo = memberRepo;
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.conversionRepo = conversionRepo;
        this.storageService = storageService;
        this.userProfileRepo = userProfileRepo;
    }

    public List<Organisation> getVerifiedOrganisations() {
        return orgRepo.findByVerificationStatus(VerificationStatus.VERIFIED);
    }

    public Organisation getOrganisationById(UUID id) {
        return orgRepo.findById(id).orElseThrow(() -> new RuntimeException("Organisation not found"));
    }

    public List<Organisation> getMyOrganisations(String userId) {
        List<OrganisationMember> memberships = memberRepo.findByUserId(UUID.fromString(userId));
        return memberships.stream()
                .map(m -> orgRepo.findById(m.getOrganisationId()).orElse(null))
                .filter(o -> o != null)
                .toList();
    }

    public Organisation createOrganisation(String userId, CreateOrganisationRequest req) {
        UUID uid = UUID.fromString(userId);
        String name = req.getName() == null ? null : req.getName().strip();
        if (name == null || name.isEmpty()) throw new IllegalArgumentException("Organisation name is required.");
        if (orgRepo.existsByName(name)) throw new DuplicateOrganisationNameException(name);
        Organisation org = Organisation.builder()
                .name(name)
                .type(req.getType())
                .website(req.getWebsite())
                .emailDomain(req.getEmailDomain())
                .description(req.getDescription())
                .build();
        org = orgRepo.save(org);
        OrganisationMember adminMember = OrganisationMember.builder()
                .organisationId(org.getId())
                .userId(uid)
                .role(OrgMemberRole.ORG_ADMIN)
                .build();
        memberRepo.save(adminMember);
        return org;
    }

    public Organisation updateOrganisation(UUID orgId, String userId, UpdateOrganisationRequest req) {
        assertAdmin(orgId, userId);
        Organisation org = orgRepo.findById(orgId).orElseThrow();
        if (req.getName() != null) {
            String newName = req.getName().strip();
            if (orgRepo.existsByNameAndIdNot(newName, orgId)) throw new DuplicateOrganisationNameException(newName);
            org.setName(newName);
        }
        if (req.getWebsite() != null) org.setWebsite(req.getWebsite());
        if (req.getEmailDomain() != null) org.setEmailDomain(req.getEmailDomain());
        if (req.getDescription() != null) org.setDescription(req.getDescription());
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
                .userId(UUID.fromString(req.getUserId()))
                .role(req.getRole() != null ? req.getRole() : OrgMemberRole.MENTOR)
                .invitedBy(UUID.fromString(inviterId))
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
        long totalEnrollments = enrollmentRepo.countByCourse_OrganisationId(orgId);
        long totalBadgesIssued = userBadgeRepo.countByBadge_OrganisationId(orgId);
        long pendingVerifications = conversionRepo.countByStatus(ConversionStatus.PENDING);
        return new DashboardStatsResponse(publishedCourses, totalEnrollments, totalBadgesIssued, pendingVerifications);
    }

    // --- Admin operations ---

    public List<Organisation> getAllOrganisations(String userId) {
        assertSystemAdmin(userId);
        return orgRepo.findAll();
    }

    public List<Organisation> getPendingOrganisations() {
        return orgRepo.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.PENDING);
    }

    public Organisation verifyOrganisation(UUID orgId, String userId) {
        assertSystemAdmin(userId);
        Organisation org = orgRepo.findById(orgId).orElseThrow(() -> new RuntimeException("Organisation not found"));
        org.setVerificationStatus(VerificationStatus.VERIFIED);
        org.setVerifiedAt(Instant.now());
        return orgRepo.save(org);
    }

    public Organisation rejectOrganisation(UUID orgId, String userId) {
        assertSystemAdmin(userId);
        Organisation org = orgRepo.findById(orgId).orElseThrow(() -> new RuntimeException("Organisation not found"));
        org.setVerificationStatus(VerificationStatus.REJECTED);
        return orgRepo.save(org);
    }

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Not a member of this organisation"));
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }

    private void assertMember(UUID orgId, String userId) {
        if (!memberRepo.existsByOrganisationIdAndUserId(orgId, UUID.fromString(userId)))
            throw new RuntimeException("Not a member of this organisation");
    }

    private void assertSystemAdmin(String userId) {
        userProfileRepo.findByUserId(UUID.fromString(userId))
            .filter(p -> "admin".equalsIgnoreCase(p.getRole()))
            .orElseThrow(() -> new RuntimeException("Requires admin role"));
    }
}
