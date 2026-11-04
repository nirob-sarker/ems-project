package com.sheharz.emsbackend.service;

import com.sheharz.emsbackend.dto.CreateLeaveRequest;
import com.sheharz.emsbackend.dto.LeaveRequestDTO;
import com.sheharz.emsbackend.dto.UpdateLeaveStatusRequest;
import com.sheharz.emsbackend.entity.Employee;
import com.sheharz.emsbackend.entity.LeaveRequest;
import com.sheharz.emsbackend.entity.User;
import com.sheharz.emsbackend.exception.ResourceNotFoundException;
import com.sheharz.emsbackend.repository.EmployeeRepository;
import com.sheharz.emsbackend.repository.LeaveRequestRepository;
import com.sheharz.emsbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // ১. Employee নিজের ছুটির আবেদন করবে
    public LeaveRequestDTO applyLeave(String username, CreateLeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for this user"));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setReason(request.getReason());

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(saved);
    }

    // ২. Employee নিজের করা ছুটির আবেদনগুলোর তালিকা দেখবে
    public List<LeaveRequestDTO> getMyLeaveRequests(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for this user"));

        return leaveRequestRepository.findByEmployeeIdOrderByAppliedOnDesc(employee.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ৩. Admin সকল কর্মচারীর ছুটির আবেদন দেখবে
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByAppliedOnDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ৪. Admin ছুটির আবেদন Approve বা Reject করবে
    public LeaveRequestDTO updateLeaveStatus(Long leaveId, UpdateLeaveStatusRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        leaveRequest.setStatus(request.getStatus());
        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        return mapToDTO(updated);
    }

    private LeaveRequestDTO mapToDTO(LeaveRequest leave) {
        return new LeaveRequestDTO(
                leave.getId(),
                leave.getEmployee().getId(),
                leave.getEmployee().getName(),
                leave.getEmployee().getDepartment().getName(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getLeaveType(),
                leave.getReason(),
                leave.getStatus(),
                leave.getAppliedOn()
        );
    }
}