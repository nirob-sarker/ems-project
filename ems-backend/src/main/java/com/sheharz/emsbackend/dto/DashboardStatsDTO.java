package com.sheharz.emsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalEmployees;
    private long totalDepartments;
    private long pendingLeaves;
    private long presentToday;
}