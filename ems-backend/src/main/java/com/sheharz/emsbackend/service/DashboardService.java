package com.sheharz.emsbackend.service;

import com.sheharz.emsbackend.dto.DashboardStatsDTO;
import com.sheharz.emsbackend.entity.LeaveStatus;
import com.sheharz.emsbackend.repository.AttendanceRepository;
import com.sheharz.emsbackend.repository.DepartmentRepository;
import com.sheharz.emsbackend.repository.EmployeeRepository;
import com.sheharz.emsbackend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    public DashboardStatsDTO getAdminStats() {
        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
        long presentToday = attendanceRepository.countByDate(LocalDate.now());

        return new DashboardStatsDTO(totalEmployees, totalDepartments, pendingLeaves, presentToday);
    }
}