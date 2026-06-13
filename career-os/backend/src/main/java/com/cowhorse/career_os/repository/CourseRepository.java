package com.cowhorse.career_os.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cowhorse.career_os.entity.Course;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrganisationId(UUID organisationId);
    List<Course> findByOrganisationIdAndIsPublishedTrue(UUID organisationId);
    List<Course> findByIsPublishedTrue();
    List<Course> findByIsPublishedTrueAndCategory(String category);
    long countByOrganisationIdAndIsPublishedTrue(UUID organisationId);
    List<Course> findByBadgeIdAndIsPublishedTrue(UUID badgeId);
}
