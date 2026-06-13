package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.CourseRecognitionRequest;
import com.cowhorse.career_os.entity.RecognitionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CourseRecognitionRepository extends JpaRepository<CourseRecognitionRequest, UUID> {
    List<CourseRecognitionRequest> findBySubmittingOrgId(UUID submittingOrgId);
    List<CourseRecognitionRequest> findByReviewingUniversityId(UUID universityId);
    List<CourseRecognitionRequest> findByReviewingUniversityIdAndStatus(UUID universityId, RecognitionStatus status);
    List<CourseRecognitionRequest> findByCourseId(UUID courseId);
    boolean existsByCourseIdAndReviewingUniversityId(UUID courseId, UUID universityId);
}
