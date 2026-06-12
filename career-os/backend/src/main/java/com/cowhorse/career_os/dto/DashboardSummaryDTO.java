package com.cowhorse.career_os.dto;

import com.cowhorse.career_os.entity.UserActivity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private long applicationsCount;
    private long interviewsCount;
    private long offersCount;
    private List<UserActivity> recentActivities;
}
