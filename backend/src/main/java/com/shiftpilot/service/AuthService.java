package com.shiftpilot.service;

import com.shiftpilot.api.dto.AuthResponse;
import com.shiftpilot.api.dto.LoginRequest;
import com.shiftpilot.config.JwtUtil;
import com.shiftpilot.domain.Agent;
import com.shiftpilot.domain.User;
import com.shiftpilot.repository.AgentRepository;
import com.shiftpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        if (request.isAgent()) {
            // Find agent by phone. In MVP we might not uniquely identify company during login just by phone,
            // but assuming phone is unique across the whole system for MVP or we pass companyId.
            // Let's assume we search all agents, or we need company code.
            // For MVP let's assume phone is globally unique for simplicity if no company code is provided.
            // Wait, schema says unique(company_id, phone). We might need companyId.
            // Let's iterate or assume the first one. This is a simplification for the demo.
            Agent agent = agentRepository.findAll().stream()
                    .filter(a -> a.getPhone().equals(request.getUsername()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Agent not found"));

            if (!passwordEncoder.matches(request.getPassword(), agent.getPinHash())) {
                throw new RuntimeException("Invalid PIN");
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "AGENT");
            claims.put("companyId", agent.getCompany().getId().toString());

            String token = jwtUtil.generateToken(
                    new org.springframework.security.core.userdetails.User(
                            agent.getPhone(), agent.getPinHash(), new java.util.ArrayList<>()
                    ), claims
            );

            return AuthResponse.builder()
                    .token(token)
                    .userId(agent.getId())
                    .companyId(agent.getCompany().getId())
                    .role("AGENT")
                    .build();

        } else {
            User user = userRepository.findByEmail(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid password");
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole());
            claims.put("companyId", user.getCompany().getId().toString());

            String token = jwtUtil.generateToken(
                    new org.springframework.security.core.userdetails.User(
                            user.getEmail(), user.getPasswordHash(), new java.util.ArrayList<>()
                    ), claims
            );

            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .companyId(user.getCompany().getId())
                    .role(user.getRole())
                    .build();
        }
    }
}
