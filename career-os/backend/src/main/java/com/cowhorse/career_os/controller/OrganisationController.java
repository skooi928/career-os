package com.cowhorse.career_os.controller;

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

import com.cowhorse.career_os.dto.OrganisationDTOs.CreateOrganisationRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.DashboardStatsResponse;
import com.cowhorse.career_os.dto.OrganisationDTOs.InviteMemberRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.UpdateMemberRoleRequest;
import com.cowhorse.career_os.dto.OrganisationDTOs.UpdateOrganisationRequest;
import com.cowhorse.career_os.entity.Organisation;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.exception.DuplicateOrganisationNameException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.OrganisationService;

@RestController
@RequestMapping("/api/organisations")
@CrossOrigin(origins = "*")
public class OrganisationController {

    private final OrganisationService orgService;
    private final JwtTokenProvider jwtTokenProvider;

    public OrganisationController(OrganisationService orgService, JwtTokenProvider jwtTokenProvider) {
        this.orgService = orgService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String getUid(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(authHeader.substring(7));
    }

    @GetMapping
    public ResponseEntity<List<Organisation>> getVerifiedOrganisations() {
        return ResponseEntity.ok(orgService.getVerifiedOrganisations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organisation> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(orgService.getOrganisationById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Organisation>> getMyOrganisations(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.getMyOrganisations(getUid(auth)));
    }

    @PostMapping
    public ResponseEntity<?> createOrganisation(@RequestHeader("Authorization") String auth,
                                                           @RequestBody CreateOrganisationRequest req) {
        try {
            return ResponseEntity.ok(orgService.createOrganisation(getUid(auth), req));
        } catch (DuplicateOrganisationNameException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganisation(@PathVariable UUID id,
                                                           @RequestHeader("Authorization") String auth,
                                                           @RequestBody UpdateOrganisationRequest req) {
        try {
            return ResponseEntity.ok(orgService.updateOrganisation(id, getUid(auth), req));
        } catch (DuplicateOrganisationNameException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload-document")
    public ResponseEntity<?> uploadDocument(@PathVariable UUID id,
                                            @RequestHeader("Authorization") String auth,
                                            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(orgService.uploadVerificationDocument(id, getUid(auth), file));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload-logo")
    public ResponseEntity<?> uploadLogo(@PathVariable UUID id,
                                        @RequestHeader("Authorization") String auth,
                                        @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(orgService.uploadLogo(id, getUid(auth), file));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<OrganisationMember>> getMembers(@PathVariable UUID id,
                                                               @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.getMembers(id, getUid(auth)));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<OrganisationMember> inviteMember(@PathVariable UUID id,
                                                           @RequestHeader("Authorization") String auth,
                                                           @RequestBody InviteMemberRequest req) {
        return ResponseEntity.ok(orgService.inviteMember(id, getUid(auth), req));
    }

    @PutMapping("/{id}/members/{memberId}")
    public ResponseEntity<OrganisationMember> updateMemberRole(@PathVariable UUID id,
                                                               @PathVariable UUID memberId,
                                                               @RequestHeader("Authorization") String auth,
                                                               @RequestBody UpdateMemberRoleRequest req) {
        return ResponseEntity.ok(orgService.updateMemberRole(id, memberId, getUid(auth), req));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id,
                                             @PathVariable UUID memberId,
                                             @RequestHeader("Authorization") String auth) {
        orgService.removeMember(id, memberId, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(@PathVariable UUID id,
                                                                    @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.getDashboardStats(id, getUid(auth)));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinOrganisation(@PathVariable UUID id,
                                              @RequestHeader("Authorization") String auth) {
        try {
            return ResponseEntity.ok(orgService.joinOrganisation(id, getUid(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/memberships/my")
    public ResponseEntity<List<OrganisationMember>> getUserMemberships(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.getUserMemberships(getUid(auth)));
    }

    // ── Admin endpoints ──

    @GetMapping("/admin/all")
    public ResponseEntity<List<Organisation>> getAllOrganisations(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.getAllOrganisations(getUid(auth)));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Organisation> verifyOrganisation(@PathVariable UUID id,
                                                           @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.verifyOrganisation(id, getUid(auth)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Organisation> rejectOrganisation(@PathVariable UUID id,
                                                           @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orgService.rejectOrganisation(id, getUid(auth)));
    }
}
