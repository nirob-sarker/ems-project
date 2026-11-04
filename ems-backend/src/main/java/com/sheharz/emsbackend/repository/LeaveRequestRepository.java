package com.sheharz.emsbackend.repository;

import com.sheharz.emsbackend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // নির্দিষ্ট Employee এর সকল ছুটির আবেদন পাওয়ার জন্য
    List<LeaveRequest> findByEmployeeIdOrderByAppliedOnDesc(Long employeeId);

    // সকল ছুটির আবেদন পাওয়ার জন্য (সবচেয়ে নতুন আবেদনগুলো উপরে থাকবে)
    List<LeaveRequest> findAllByOrderByAppliedOnDesc();
}