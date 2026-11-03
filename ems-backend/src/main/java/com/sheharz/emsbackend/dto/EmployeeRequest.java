package com.sheharz.emsbackend.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private String name;
    private String phone;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;
}