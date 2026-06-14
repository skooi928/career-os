package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseRecognitionService {

    private final CourseRecognitionRepository recognitionRepo;
    private final CourseRepository courseRepo;
    private final OrganisationMemberRepository memberRepo;
    private final OrganisationRepository orgRepo;

    // ── Industry org submits course for recognition ───────────────────────────

    @Transactional
    public CourseRecognitionRequest submitForRecognition(UUID courseId, String userId, SubmitRecognitionRequest req) {
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        assertMember(course.getOrganisationId(), userId);

        UUID uniId = req.reviewingUniversityId() != null ? UUID.fromString(req.reviewingUniversityId()) : null;
        if (uniId != null && recognitionRepo.existsByCourseIdAndReviewingUniversityId(courseId, uniId)) {
            throw new RuntimeException("Recognition request already submitted to this university");
        }

        return recognitionRepo.save(CourseRecognitionRequest.builder()
                .courseId(courseId)
                .submittingOrgId(course.getOrganisationId())
                .reviewingUniversityId(uniId)
                .syllabusUrl(req.syllabusUrl())
                .learningOutcomes(req.learningOutcomes())
                .creditHours(req.creditHours())
                .build());
    }

    // ── Industry tracks own submissions ──────────────────────────────────────

    public List<CourseRecognitionRequest> getOrgSubmissions(UUID orgId, String userId) {
        assertMember(orgId, userId);
        return recognitionRepo.findBySubmittingOrgId(orgId);
    }

    // ── University reviews incoming requests ──────────────────────────────────

    public List<CourseRecognitionRequest> getIncomingRequests(UUID universityId, String userId) {
        assertMember(universityId, userId);
        return recognitionRepo.findByReviewingUniversityId(universityId);
    }

    @Transactional
    public CourseRecognitionRequest reviewRequest(UUID requestId, String userId, ReviewDecisionRequest req) {
        CourseRecognitionRequest r = recognitionRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (r.getReviewingUniversityId() == null) throw new RuntimeException("No university assigned to this request");
        assertMember(r.getReviewingUniversityId(), userId);

        r.setStatus(RecognitionStatus.valueOf(req.status().toUpperCase()));
        r.setReviewerNotes(req.notes());
        r.setReviewedAt(Instant.now());
        r.setUpdatedAt(Instant.now());
        return recognitionRepo.save(r);
    }

    // ── Course-level view ─────────────────────────────────────────────────────

    public List<CourseRecognitionRequest> getCourseRecognitions(UUID courseId) {
        return recognitionRepo.findByCourseId(courseId);
    }

    // ── Public: get all approved recognitions for a university ─────────────────

    public List<CourseRecognitionRequest> getApprovedRecognitions(UUID universityId) {
        return recognitionRepo.findByReviewingUniversityIdAndStatus(universityId, RecognitionStatus.APPROVED);
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public record SubmitRecognitionRequest(String reviewingUniversityId, String syllabusUrl,
                                           String learningOutcomes, Integer creditHours) {}

    public record ReviewDecisionRequest(String status, String notes) {}

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertMember(UUID orgId, String userId) {
        if (!memberRepo.existsByOrganisationIdAndUserId(orgId, UUID.fromString(userId)))
            throw new RuntimeException("Not a member of this organisation");
    }
}
