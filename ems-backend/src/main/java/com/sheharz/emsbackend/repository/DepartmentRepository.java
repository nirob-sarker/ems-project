package com.sheharz.emsbackend.repository;

import com.sheharz.emsbackend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // Basic CRUD methods automatically available from JpaRepository
    // Jodi kono custom query lagbe, ekhane add korbo
}