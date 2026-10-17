package com.shiftpilot.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails extends User {
    private final UUID userId;
    private final UUID companyId;

    public CustomUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities, UUID userId, UUID companyId) {
        super(username, password, authorities);
        this.userId = userId;
        this.companyId = companyId;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCompanyId() {
        return companyId;
    }
}
