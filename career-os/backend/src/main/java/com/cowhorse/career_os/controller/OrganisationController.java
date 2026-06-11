package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.dto.OrganisationDTOs.*;
import com.cowhorse.career_os.entity.Organisation;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.OrganisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<Organisation> createOrganisation(@RequestHeader("Authorization") String auth,
                                                           @RequestBody CreateOrganisationRequest req) {
        return ResponseEntity.ok(orgService.createOrganisation(getUid(auth), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Organisation> updateOrganisation(@PathVariable UUID id,
                                                           @RequestHeader("Authorization") String auth,
                                                           @RequestBody UpdateOrganisationRequest req) {
        return ResponseEntity.ok(orgService.updateOrganisation(id, getUid(auth), req));
    }

    @PostMapping("/{id}/upload-document")
    public ResponseEntity<Organisation> uploadDocument(@PathVariable UUID id,
                                                       @RequestHeader("Authorization") String auth,
                                                       @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(orgService.uploadVerificationDocument(id, getUid(auth), file));
    }

    @PostMapping("/{id}/upload-logo")
    public ResponseEntity<Organisation> uploadLogo(@PathVariable UUID id,
                                                   @RequestHeader("Authorization") String auth,
                                                   @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(orgService.uploadLogo(id, getUid(auth), file));
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
}
