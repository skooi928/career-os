package com.cowhorse.career_os.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cowhorse.career_os.dto.UpskillingDTOs.CreateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.EnrollRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.LearnerStatsResponse;
import com.cowhorse.career_os.dto.UpskillingDTOs.LinkCourseBadgeRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateCourseRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateProgressRequest;
import com.cowhorse.career_os.dto.UpskillingDTOs.UpdateProgressResponse;
import com.cowhorse.career_os.entity.Course;
import com.cowhorse.career_os.entity.CourseEnrollment;
import com.cowhorse.career_os.entity.DifficultyLevel;
import com.cowhorse.career_os.entity.EnrollmentStatus;
import com.cowhorse.career_os.entity.OrgMemberRole;
import com.cowhorse.career_os.entity.OrganisationMember;
import com.cowhorse.career_os.entity.UserBadge;
import com.cowhorse.career_os.repository.CourseEnrollmentRepository;
import com.cowhorse.career_os.repository.CourseRepository;
import com.cowhorse.career_os.repository.OrganisationMemberRepository;

@Service
public class UpskillingService {

    private final CourseRepository courseRepo;
    private final CourseEnrollmentRepository enrollmentRepo;
    private final OrganisationMemberRepository memberRepo;
    private final BadgeService badgeService;

    public UpskillingService(CourseRepository courseRepo,
                             CourseEnrollmentRepository enrollmentRepo,
                             OrganisationMemberRepository memberRepo,
                             BadgeService badgeService) {
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.memberRepo = memberRepo;
        this.badgeService = badgeService;
    }

    public List<Course> getPublishedCourses(String category) {
        if (category != null && !category.isBlank()) {
            return courseRepo.findByIsPublishedTrueAndCategory(category);
        }
        return courseRepo.findByIsPublishedTrue();
    }

    /** Public — no membership check. Returns only published courses for the org. */
    public List<Course> getPublicOrgCourses(UUID orgId) {
        return courseRepo.findByOrganisationIdAndIsPublishedTrue(orgId);
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

    public UpdateProgressResponse updateProgress(UUID enrollmentId, String userId, UpdateProgressRequest req) {
        CourseEnrollment enrollment = enrollmentRepo.findById(enrollmentId).orElseThrow();
        if (!enrollment.getUserId().equals(UUID.fromString(userId))) throw new RuntimeException("Unauthorized");
        enrollment.setProgressPercentage(req.getProgressPercentage());

        UserBadge awardedBadge = null;
        if (req.getProgressPercentage() >= 100 && enrollment.getCompletionStatus() != EnrollmentStatus.COMPLETED) {
            enrollment.setCompletionStatus(EnrollmentStatus.COMPLETED);
            // Auto-award linked badge if course has one
            Course course = courseRepo.findById(enrollment.getCourseId()).orElseThrow();
            if (course.getBadgeId() != null) {
                awardedBadge = badgeService.autoAwardFromCourse(
                    enrollment.getUserId(), course.getId(), course.getBadgeId()
                );
            }
        }

        CourseEnrollment saved = enrollmentRepo.save(enrollment);
        return new UpdateProgressResponse(saved, awardedBadge);
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

    /** Link (or unlink) a badge to a course. Only org admins can do this. */
    public Course linkBadgeToCourse(UUID orgId, UUID courseId, String userId, LinkCourseBadgeRequest req) {
        assertAdmin(orgId, userId);
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        course.setBadgeId(req.getBadgeId()); // null = unlink
        return courseRepo.save(course);
    }

    // --- Helpers ---
    private void assertAdmin(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Not a member"));
        if (!"APPROVED".equalsIgnoreCase(m.getStatus())) {
            throw new RuntimeException("Organisation membership is pending approval");
        }
        if (m.getRole() != OrgMemberRole.ORG_ADMIN) throw new RuntimeException("Requires ORG_ADMIN role");
    }

    private void assertMember(UUID orgId, String userId) {
        OrganisationMember m = memberRepo.findByOrganisationIdAndUserId(orgId, UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Not a member of this organisation"));
        if (!"APPROVED".equalsIgnoreCase(m.getStatus())) {
            throw new RuntimeException("Organisation membership is pending approval");
        }
    }
}
