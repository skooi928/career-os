package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.CourseRecognitionRequest;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.CourseRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/course-recognition")
@RequiredArgsConstructor
public class CourseRecognitionController {

    private final CourseRecognitionService recognitionService;
    private final JwtTokenProvider jwtTokenProvider;

    private String getUid(String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(auth.substring(7));
    }

    /** Industry: submit course for university recognition */
    @PostMapping("/courses/{courseId}/submit")
    public ResponseEntity<CourseRecognitionRequest> submit(
            @PathVariable UUID courseId,
            @RequestHeader("Authorization") String auth,
            @RequestBody CourseRecognitionService.SubmitRecognitionRequest req) {
        return ResponseEntity.ok(recognitionService.submitForRecognition(courseId, getUid(auth), req));
    }

    /** Industry: get all submissions for own org */
    @GetMapping("/org/{orgId}/submissions")
    public ResponseEntity<List<CourseRecognitionRequest>> getOrgSubmissions(
            @PathVariable UUID orgId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recognitionService.getOrgSubmissions(orgId, getUid(auth)));
    }

    /** University: get all incoming requests to review */
    @GetMapping("/university/{universityId}/requests")
    public ResponseEntity<List<CourseRecognitionRequest>> getIncoming(
            @PathVariable UUID universityId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recognitionService.getIncomingRequests(universityId, getUid(auth)));
    }

    /** University: approve / reject / request revision */
    @PatchMapping("/{requestId}/review")
    public ResponseEntity<CourseRecognitionRequest> review(
            @PathVariable UUID requestId,
            @RequestHeader("Authorization") String auth,
            @RequestBody CourseRecognitionService.ReviewDecisionRequest req) {
        return ResponseEntity.ok(recognitionService.reviewRequest(requestId, getUid(auth), req));
    }

    /** Public: get approved recognitions for a university (for public profile display) */
    @GetMapping("/university/{universityId}/approved")
    public ResponseEntity<List<CourseRecognitionRequest>> getApproved(
            @PathVariable UUID universityId) {
        return ResponseEntity.ok(recognitionService.getApprovedRecognitions(universityId));
    }

    /** Get all recognition requests for a course */
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<CourseRecognitionRequest>> getCourseRecognitions(
            @PathVariable UUID courseId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(recognitionService.getCourseRecognitions(courseId));
    }
}
