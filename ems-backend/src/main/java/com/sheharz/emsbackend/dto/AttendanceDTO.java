package com.sheharz.emsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}