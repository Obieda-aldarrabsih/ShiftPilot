package com.shiftpilot.api;

import com.shiftpilot.api.dto.CreateTaskRequest;
import com.shiftpilot.api.dto.TaskDto;
import com.shiftpilot.api.dto.AnalyticsDto;
import com.shiftpilot.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.shiftpilot.config.CustomUserDetails;
import com.shiftpilot.service.AutoAssignService;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final AutoAssignService autoAssignService;

    private UUID getCompanyId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getCompanyId();
    }

    private UUID getUserId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUserId();
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<TaskDto> createTask(@RequestBody CreateTaskRequest request, Authentication authentication) {
        return ResponseEntity.ok(taskService.createTask(getCompanyId(authentication), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<List<TaskDto>> getTasks(Authentication authentication) {
        return ResponseEntity.ok(taskService.getTasksByCompany(getCompanyId(authentication)));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<AnalyticsDto> getAnalytics(Authentication authentication) {
        return ResponseEntity.ok(taskService.getAnalytics(getCompanyId(authentication)));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<TaskDto> assignTask(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        UUID agentId = UUID.fromString(payload.get("agentId"));
        return ResponseEntity.ok(taskService.assignTask(id, agentId));
    }

    @PostMapping("/{id}/auto-assign")
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<TaskDto> autoAssignTask(@PathVariable UUID id) {
        return ResponseEntity.ok(autoAssignService.autoAssignTask(getCompanyId(SecurityContextHolder.getContext().getAuthentication()), id));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasRole('AGENT') or hasRole('MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<TaskDto> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> payload, Authentication authentication) {
        String status = payload.get("status");
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, getUserId(authentication)));
    }
}


