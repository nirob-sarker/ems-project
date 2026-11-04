package com.sheharz.emsbackend.controller;

import com.sheharz.emsbackend.dto.CreateLeaveRequest;
import com.sheharz.emsbackend.dto.LeaveRequestDTO;
import com.sheharz.emsbackend.dto.UpdateLeaveStatusRequest;
import com.sheharz.emsbackend.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    // Employee ছুটির আবেদন পাঠাবে
    @PostMapping
    public ResponseEntity<LeaveRequestDTO> applyLeave(
            Authentication authentication,
            @Valid @RequestBody CreateLeaveRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(leaveRequestService.applyLeave(username, request));
    }

    // Employee নিজের আবেদনের তালিকা দেখবে
    @GetMapping("/me")
    public ResponseEntity<List<LeaveRequestDTO>> getMyLeaveRequests(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(leaveRequestService.getMyLeaveRequests(username));
    }

    // Admin সকল ছুটির আবেদন দেখবে
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    // Admin ছুটির আবেদন Approve/Reject করবে
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeaveRequestDTO> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLeaveStatusRequest request
    ) {
        return ResponseEntity.ok(leaveRequestService.updateLeaveStatus(id, request));
    }
}