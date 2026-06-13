package com.cowhorse.career_os.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cowhorse.career_os.entity.CourseEnrollment;
import com.cowhorse.career_os.entity.EnrollmentStatus;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    List<CourseEnrollment> findByUserId(UUID userId);
    List<CourseEnrollment> findByCourseId(UUID courseId);
    Optional<CourseEnrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);
    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);
    long countByUserIdAndCompletionStatus(UUID userId, EnrollmentStatus status);
    long countByCourse_OrganisationId(UUID organisationId);
}
