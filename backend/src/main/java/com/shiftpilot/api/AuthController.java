package com.shiftpilot.api;

import com.shiftpilot.api.dto.AuthResponse;
import com.shiftpilot.api.dto.LoginRequest;
import com.shiftpilot.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        request.setAgent(false);
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/agent-login")
    public ResponseEntity<AuthResponse> agentLogin(@RequestBody LoginRequest request) {
        request.setAgent(true);
        return ResponseEntity.ok(authService.login(request));
    }
}
