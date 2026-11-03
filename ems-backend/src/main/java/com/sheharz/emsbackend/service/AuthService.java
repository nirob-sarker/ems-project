package com.sheharz.emsbackend.service;


import com.sheharz.emsbackend.dto.AuthResponse;
import com.sheharz.emsbackend.dto.LoginRequest;
import com.sheharz.emsbackend.dto.RegisterRequest;
import com.sheharz.emsbackend.entity.Role;
import com.sheharz.emsbackend.entity.User;
import com.sheharz.emsbackend.repository.UserRepository;
import com.sheharz.emsbackend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.sheharz.emsbackend.exception.DuplicateResourceException;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {

        // Check: Username আগে থেকে ব্যবহার হয়েছে কিনা
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken");
        }

        // Check: Email আগে থেকে ব্যবহার হয়েছে কিনা
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        // নতুন User তৈরি করা
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Password Hash করা হচ্ছে
        user.setRole(Role.EMPLOYEE); // Default role - নতুন রেজিস্টার করা সবাই EMPLOYEE হবে

        userRepository.save(user);

        // Token generate করে সাথে সাথে Login করিয়ে দিচ্ছি
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {

        // Spring Security দিয়ে Authenticate করা (Username/Password যাচাই)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Authenticate সফল হলে, User কে Database থেকে আনা (role জানার জন্য)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}