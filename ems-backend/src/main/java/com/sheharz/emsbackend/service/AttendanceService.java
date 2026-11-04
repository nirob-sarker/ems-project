package com.sheharz.emsbackend.service;

import com.sheharz.emsbackend.dto.AttendanceDTO;
import com.sheharz.emsbackend.entity.Attendance;
import com.sheharz.emsbackend.entity.Employee;
import com.sheharz.emsbackend.entity.User;
import com.sheharz.emsbackend.exception.DuplicateResourceException;
import com.sheharz.emsbackend.exception.ResourceNotFoundException;
import com.sheharz.emsbackend.repository.AttendanceRepository;
import com.sheharz.emsbackend.repository.EmployeeRepository;
import com.sheharz.emsbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    private Employee getEmployeeFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));
    }

    // ১. Check-In করা
    public AttendanceDTO checkIn(String username) {
        Employee employee = getEmployeeFromUsername(username);
        LocalDate today = LocalDate.now();

        // চেক করা হচ্ছে আজকে আগেই Check-in করেছে কিনা
        if (attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today).isPresent()) {
            throw new DuplicateResourceException("You have already checked in today.");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setCheckInTime(LocalTime.now());

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDTO(saved);
    }

    // ২. Check-Out করা
    public AttendanceDTO checkOut(String username) {
        Employee employee = getEmployeeFromUsername(username);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new ResourceNotFoundException("No check-in found for today. Please check in first."));

        if (attendance.getCheckOutTime() != null) {
            throw new DuplicateResourceException("You have already checked out today.");
        }

        attendance.setCheckOutTime(LocalTime.now());
        Attendance saved = attendanceRepository.save(attendance);
        return mapToDTO(saved);
    }

    // ৩. নিজের হাজিরা দেখা
    public List<AttendanceDTO> getMyAttendance(String username) {
        Employee employee = getEmployeeFromUsername(username);
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(employee.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ৪. Admin সবার হাজিরা দেখবে
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAllByOrderByDateDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Helper Method
    private AttendanceDTO mapToDTO(Attendance attendance) {
        return new AttendanceDTO(
                attendance.getId(),
                attendance.getEmployee().getId(),
                attendance.getEmployee().getName(),
                attendance.getEmployee().getDepartment().getName(),
                attendance.getDate(),
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
        );
    }
}