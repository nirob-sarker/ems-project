package com.sheharz.emsbackend.controller;

import com.sheharz.emsbackend.dto.AttendanceDTO;
import com.sheharz.emsbackend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Check-in API
    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDTO> checkIn(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkIn(authentication.getName()));
    }

    // Check-out API
    @PutMapping("/check-out")
    public ResponseEntity<AttendanceDTO> checkOut(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkOut(authentication.getName()));
    }

    // নিজের হাজিরা দেখা
    @GetMapping("/me")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(authentication.getName()));
    }

    // Admin এর জন্য সবার হাজিরা দেখা
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}