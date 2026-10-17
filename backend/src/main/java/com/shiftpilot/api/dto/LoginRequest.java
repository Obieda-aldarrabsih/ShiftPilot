package com.shiftpilot.api.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username; // Email for manager/dispatcher, phone for agent
    private String password; // Password for manager, PIN for agent
    private boolean isAgent;
}
