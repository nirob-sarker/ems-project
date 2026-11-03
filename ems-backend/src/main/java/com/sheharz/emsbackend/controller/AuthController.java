package com.sheharz.emsbackend.controller;


import com.sheharz.emsbackend.dto.AuthResponse;
import com.sheharz.emsbackend.dto.LoginRequest;
import com.sheharz.emsbackend.dto.RegisterRequest;
import com.sheharz.emsbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sheharz.emsbackend.dto.PasswordChangeRequest;
import com.sheharz.emsbackend.dto.MessageResponse;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(authService.changePassword(username, request));
    }
}