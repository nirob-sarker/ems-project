package com.sheharz.emsbackend.service;

import com.sheharz.emsbackend.dto.EmployeeDTO;
import com.sheharz.emsbackend.dto.EmployeeRequest;
import com.sheharz.emsbackend.dto.EmployeeUpdateRequest;
import com.sheharz.emsbackend.dto.UserSummaryDTO;
import com.sheharz.emsbackend.entity.Department;
import com.sheharz.emsbackend.entity.Employee;
import com.sheharz.emsbackend.entity.User;
import com.sheharz.emsbackend.exception.DuplicateResourceException;
import com.sheharz.emsbackend.exception.ResourceNotFoundException;
import com.sheharz.emsbackend.repository.DepartmentRepository;
import com.sheharz.emsbackend.repository.EmployeeRepository;
import com.sheharz.emsbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeDTO createEmployee(EmployeeRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        if (employeeRepository.findByUserId(user.getId()).isPresent()) {
            throw new DuplicateResourceException("This user already has an employee profile");
        }

        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setUser(user);
        employee.setDepartment(department);

        Employee saved = employeeRepository.save(employee);
        return mapToDTO(saved);
    }

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDTO(employee);
    }

    public EmployeeDTO getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for this user"));

        return mapToDTO(employee);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        employee.setName(request.getName());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setDepartment(department);

        Employee updated = employeeRepository.save(employee);
        return mapToDTO(updated);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    public List<UserSummaryDTO> getUnassignedUsers() {
        return userRepository.findUnassignedUsers()
                .stream()
                .map(user -> new UserSummaryDTO(user.getId(), user.getUsername(), user.getEmail()))
                .toList();
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        return new EmployeeDTO(
                employee.getId(),
                employee.getName(),
                employee.getPhone(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getJoiningDate(),
                employee.getUser().getUsername(),
                employee.getUser().getEmail(),
                employee.getDepartment().getId(),
                employee.getDepartment().getName()
        );
    }
}