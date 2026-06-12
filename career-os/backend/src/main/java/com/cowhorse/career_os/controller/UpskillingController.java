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

import com.cowhorse.career_os.dto.UpskillingDTOs.*;
import com.cowhorse.career_os.dto.UpskillingDTOs.CreateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.EnrollRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.LearnerStatsResponse;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateProgressRequest;
import com.cowhorse.career_os.entity.Course;
import com.cowhorse.career_os.entity.CourseEnrollment;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.UpskillingService;

@RestController
@RequestMapping("/api/upskilling")
@CrossOrigin(origins = "*")
public class UpskillingController {

    private final UpskillingService upskillingService;
    private final JwtTokenProvider jwtTokenProvider;

    public UpskillingController(UpskillingService upskillingService, JwtTokenProvider jwtTokenProvider) {
        this.upskillingService = upskillingService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String getUid(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(authHeader.substring(7));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getPublishedCourses(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(upskillingService.getPublishedCourses(category));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID courseId) {
        return ResponseEntity.ok(upskillingService.getCourseById(courseId));
    }

    @PostMapping("/enroll")
    public ResponseEntity<CourseEnrollment> enroll(@RequestHeader("Authorization") String auth,
                                                    @RequestBody EnrollRequest req) {
        return ResponseEntity.ok(upskillingService.enroll(getUid(auth), req));
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    public ResponseEntity<CourseEnrollment> updateProgress(@PathVariable UUID enrollmentId,
                                                           @RequestHeader("Authorization") String auth,
                                                           @RequestBody UpdateProgressRequest req) {
        return ResponseEntity.ok(upskillingService.updateProgress(enrollmentId, getUid(auth), req));
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<Void> dropCourse(@PathVariable UUID enrollmentId,
                                           @RequestHeader("Authorization") String auth) {
        upskillingService.dropCourse(enrollmentId, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<CourseEnrollment>> getMyEnrollments(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(upskillingService.getMyEnrollments(getUid(auth)));
    }

    @GetMapping("/my-stats")
    public ResponseEntity<LearnerStatsResponse> getMyStats(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(upskillingService.getMyStats(getUid(auth)));
    }

    // --- Org management ---

    @GetMapping("/org/{orgId}/courses")
    public ResponseEntity<List<Course>> getOrgCourses(@PathVariable UUID orgId,
                                                       @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(upskillingService.getOrgCourses(orgId, getUid(auth)));
    }

    @PostMapping("/org/{orgId}/courses")
    public ResponseEntity<Course> createCourse(@PathVariable UUID orgId,
                                               @RequestHeader("Authorization") String auth,
                                               @RequestBody CreateCourseRequest req) {
        return ResponseEntity.ok(upskillingService.createCourse(orgId, getUid(auth), req));
    }

    @PutMapping("/org/{orgId}/courses/{courseId}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID orgId,
                                               @PathVariable UUID courseId,
                                               @RequestHeader("Authorization") String auth,
                                               @RequestBody UpdateCourseRequest req) {
        return ResponseEntity.ok(upskillingService.updateCourse(orgId, courseId, getUid(auth), req));
    }

    @DeleteMapping("/org/{orgId}/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID orgId,
                                             @PathVariable UUID courseId,
                                             @RequestHeader("Authorization") String auth) {
        upskillingService.deleteCourse(orgId, courseId, getUid(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/org/{orgId}/courses/{courseId}/publish")
    public ResponseEntity<Course> publishCourse(@PathVariable UUID orgId,
                                                @PathVariable UUID courseId,
                                                @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(upskillingService.publishCourse(orgId, courseId, getUid(auth)));
    }

    @GetMapping("/org/{orgId}/courses/{courseId}/enrollments")
    public ResponseEntity<List<CourseEnrollment>> getCourseEnrollments(@PathVariable UUID orgId,
                                                                        @PathVariable UUID courseId,
                                                                        @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(upskillingService.getCourseEnrollments(orgId, courseId, getUid(auth)));
    }
}
