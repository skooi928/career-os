package com.cowhorse.career_os.repository;

import com.cowhorse.career_os.entity.ConversionStatus;
import com.cowhorse.career_os.entity.UniversityCourseConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UniversityCourseConversionRepository extends JpaRepository<UniversityCourseConversion, UUID> {
    List<UniversityCourseConversion> findByUserId(String userId);
    List<UniversityCourseConversion> findByStatus(ConversionStatus status);
    List<UniversityCourseConversion> findByStatusOrderByCreatedAtDesc(ConversionStatus status);
    long countByStatus(ConversionStatus status);
}
