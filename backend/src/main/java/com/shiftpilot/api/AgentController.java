package com.shiftpilot.api;

import com.shiftpilot.api.dto.AgentDto;
import com.shiftpilot.config.CustomUserDetails;
import com.shiftpilot.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;
    private final com.shiftpilot.service.TaskService taskService;

    private UUID getCompanyId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getCompanyId();
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<List<AgentDto>> getAgents(Authentication authentication) {
        return ResponseEntity.ok(agentService.getAgentsByCompany(getCompanyId(authentication)));
    }

    @GetMapping("/{id}/tasks")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<com.shiftpilot.api.dto.TaskDto>> getAgentTasks(@org.springframework.web.bind.annotation.PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getAgentTasks(id));
    }
}
