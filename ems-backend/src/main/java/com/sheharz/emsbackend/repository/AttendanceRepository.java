package com.sheharz.emsbackend.repository;

import com.sheharz.emsbackend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // আজকের দিনে এই Employee এর কোনো হাজিরা আছে কিনা চেক করা
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    // Employee এর নিজের সব হাজিরা দেখা
    List<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId);

    // Admin এর জন্য সবার হাজিরা দেখা
    List<Attendance> findAllByOrderByDateDesc();
}