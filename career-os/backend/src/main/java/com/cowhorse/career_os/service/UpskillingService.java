package com.cowhorse.career_os.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cowhorse.career_os.dto.UpskillingDTOs.CreateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.EnrollRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.LearnerStatsResponse;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateProgressRequest;
import com.cowhorse.career_os.entity.Course;
import com.cowhorse.career_os.entity.CourseEnrollment;
import com.cowhorse.career_os.entity.DifficultyLevel;
import com.cowhorse.career_os.entity.EnrollmentStatus;
import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.repository.CourseEnrollmentRepository;
import com.cowhorse.career_os.repository.CourseRepository;
import com.cowhorse.career_os.repository.OrganisationMemberRepository;

@Service
public class UpskillingService {

    private final CourseRepository courseRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final OrganisationMemberRepository memberRepo;

    public UpskillingService(CourseRepository courseRepo,
                             CourseEnrollmentRepository enrollmentRepo,
                             OrganisationMemberRepository memberRepo) {
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.memberRepo = memberRepo;
    }

    public List<Course> getPublishedCourses(String category) {
        if (category != null && !category.isBlank()) {
            return courseRepo.findByIsPublishedTrueAndCategory(category);
        }
        return courseRepo.findByIsPublishedTrue();
    }

    public Course getCourseById(UUID courseId) {
        return courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public CourseEnrollment enroll(String userId, EnrollRequest req) {
        UUID uid = UUID.fromString(userId);
        if (enrollmentRepo.existsByUserIdAndCourseId(uid, req.getCourseId())) {
            throw new RuntimeException("Already enrolled in this course");
        }
        courseRepo.findById(req.getCourseId()).orElseThrow(() -> new RuntimeException("Course not found"));
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .userId(uid)
                .courseId(req.getCourseId())
                .build();
        return enrollmentRepo.save(enrollment);
    }

    public CourseEnrollment updateProgress(UUID enrollmentId, String userId, UpdateProgressRequest req) {
        CourseEnrollment enrollment = enrollmentRepo.findById(enrollmentId).orElseThrow();
        if (!enrollment.getUserId().equals(UUID.fromString(userId))) throw new RuntimeException("Unauthorized");
        enrollment.setProgressPercentage(req.getProgressPercentage());
        if (req.getProgressPercentage() >= 100) {
            enrollment.setCompletionStatus(EnrollmentStatus.COMPLETED);
        }
        return enrollmentRepo.save(enrollment);
    }

    public void dropCourse(UUID enrollmentId, String userId) {
        CourseEnrollment enrollment = enrollmentRepo.findById(enrollmentId).orElseThrow();
        if (!enrollment.getUserId().equals(UUID.fromString(userId))) throw new RuntimeException("Unauthorized");
        enrollmentRepo.delete(enrollment);
    }

    public List<CourseEnrollment> getMyEnrollments(String userId) {
        return enrollmentRepo.findByUserId(UUID.fromString(userId));
    }

    public LearnerStatsResponse getMyStats(String userId) {
        List<CourseEnrollment> enrollments = enrollmentRepo.findByUserId(UUID.fromString(userId));
        long completed = enrollments.stream().filter(e -> e.getCompletionStatus() == EnrollmentStatus.COMPLETED).count();
        long inProgress = enrollments.stream().filter(e -> e.getCompletionStatus() == EnrollmentStatus.IN_PROGRESS).count();
        long dropped = enrollments.stream().filter(e -> e.getCompletionStatus() == EnrollmentStatus.DROPPED).count();
        return new LearnerStatsResponse(enrollments.size(), completed, inProgress, dropped);
    }

    // --- Org course management ---

    public List<Course> getOrgCourses(UUID orgId, String userId) {
        assertMember(orgId, userId);
        return courseRepo.findByOrganisationId(orgId);
    }

    public Course createCourse(UUID orgId, String userId, CreateCourseRequest req) {
        assertAdmin(orgId, userId);
        Course course = Course.builder()
                .organisationId(orgId)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .difficultyLevel(req.getDifficultyLevel() != null ? req.getDifficultyLevel() : DifficultyLevel.BEGINNER)
                .durationHours(req.getDurationHours())
                .build();
        return courseRepo.save(course);
    }

    public Course updateCourse(UUID orgId, UUID courseId, String userId, UpdateCourseRequest req) {
        assertAdmin(orgId, userId);
        Course course = courseRepo.findById(courseId).orElseThrow();
        if (req.getTitle() != null) course.setTitle(req.getTitle());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getCategory() != null) course.setCategory(req.getCategory());
        if (req.getDifficultyLevel() != null) course.setDifficultyLevel(req.getDifficultyLevel());
        if (req.getDurationHours() != null) course.setDurationHours(req.getDurationHours());
        return courseRepo.save(course);
    }

    public void deleteCourse(UUID orgId, UUID courseId, String userId) {
        assertAdmin(orgId, userId);
        courseRepo.deleteById(courseId);
    }

    public Course publishCourse(UUID orgId, UUID courseId, String userId) {
        assertAdmin(orgId, userId);
        Course course = courseRepo.findById(courseId).orElseThrow();
        course.setPublished(true);
        return courseRepo.save(course);
    }

    public List<CourseEnrollment> getCourseEnrollments(UUID orgId, UUID courseId, String userId) {
        assertMember(orgId, userId);
        return enrollmentRepo.findByCourseId(courseId);
    }

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }

    private void assertMember(UUID orgId, String userId) {
        if (!memberRepo.existsByOrganisationIdAndUserId(orgId, UUID.fromString(userId)))
            throw new RuntimeException("Not a member of this organisation");
    }
}
