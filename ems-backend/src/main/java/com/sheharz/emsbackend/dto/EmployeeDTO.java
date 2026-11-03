package com.sheharz.emsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {

    private Long id;
    private String name;
    private String phone;
    private String designation;
    private Double salary;
    private LocalDate joiningDate;

    private String username;
    private String email;

    private Long departmentId;
    private String departmentName;
}