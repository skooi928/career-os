package com.cowhorse.career_os.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cowhorse.career_os.entity.Organisation;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.repository.UserProfileRepository;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.OrganisationService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final OrganisationService orgService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserProfileRepository userProfileRepo;

    public AdminController(OrganisationService orgService,
                           JwtTokenProvider jwtTokenProvider,
                           UserProfileRepository userProfileRepo) {
        this.orgService = orgService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userProfileRepo = userProfileRepo;
    }

    private String getUid(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(authHeader.substring(7));
    }

    private void assertAdmin(String authHeader) {
        String uid = getUid(authHeader);
        String role = jwtTokenProvider.getRoleForUser(uid, userProfileRepo);
        if (!"admin".equalsIgnoreCase(role))
            throw new AuthenticationException("Admin access required");
    }

    @GetMapping("/organisations/pending")
    public ResponseEntity<List<Organisation>> getPendingOrganisations(
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        return ResponseEntity.ok(orgService.getPendingOrganisations());
    }

    @PutMapping("/organisations/{id}/verify")
    public ResponseEntity<Organisation> verifyOrganisation(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        return ResponseEntity.ok(orgService.verifyOrganisation(id, getUid(auth)));
    }

    @PutMapping("/organisations/{id}/reject")
    public ResponseEntity<Organisation> rejectOrganisation(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        return ResponseEntity.ok(orgService.rejectOrganisation(id, getUid(auth)));
    }

    @GetMapping("/memberships/pending")
    public ResponseEntity<List<com.cowhorse.career_os.dto.OrganisationDTOs.PendingMembershipDTO>> getPendingMemberships(
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        return ResponseEntity.ok(orgService.getPendingMemberships(getUid(auth)));
    }

    @PutMapping("/memberships/{id}/approve")
    public ResponseEntity<Void> approveMembership(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        orgService.approveMembership(id, getUid(auth));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/memberships/{id}/reject")
    public ResponseEntity<Void> rejectMembership(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String auth) {
        assertAdmin(auth);
        orgService.rejectMembership(id, getUid(auth));
        return ResponseEntity.ok().build();
    }
}
