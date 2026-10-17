package com.shiftpilot.service;

import com.shiftpilot.domain.Agent;
import com.shiftpilot.domain.User;
import com.shiftpilot.repository.AgentRepository;
import com.shiftpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try user by email
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new com.shiftpilot.config.CustomUserDetails(
                    user.getEmail(),
                    user.getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())),
                    user.getId(),
                    user.getCompany().getId()
            );
        }

        Optional<Agent> agentOpt = agentRepository.findAll().stream()
                .filter(a -> a.getPhone().equals(username))
                .findFirst();
                
        if (agentOpt.isPresent()) {
            Agent agent = agentOpt.get();
            return new com.shiftpilot.config.CustomUserDetails(
                    agent.getPhone(),
                    agent.getPinHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_AGENT")),
                    agent.getId(),
                    agent.getCompany().getId()
            );
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}
