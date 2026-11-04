package com.sheharz.emsbackend.dto;

import com.sheharz.emsbackend.entity.LeaveStatus;
import com.sheharz.emsbackend.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class LeaveRequestDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveType leaveType;
    private String reason;
    private LeaveStatus status;
    private LocalDate appliedOn;
}