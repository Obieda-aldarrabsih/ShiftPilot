package com.shiftpilot.service;

import com.shiftpilot.api.dto.TaskDto;
import com.shiftpilot.domain.Agent;
import com.shiftpilot.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AutoAssignService {

    private final AgentRepository agentRepository;
    private final TaskService taskService;

    public TaskDto autoAssignTask(UUID companyId, UUID taskId) {
        List<Agent> availableAgents = agentRepository.findByCompanyIdAndStatusAndOnShiftTrue(companyId, "ACTIVE");
        
        if (availableAgents.isEmpty()) {
            throw new RuntimeException("No eligible agents available");
        }
        
        // Simple scoring logic: pick agent with minimum current load
        Optional<Agent> bestAgentOpt = availableAgents.stream()
                .min(Comparator.comparingInt(Agent::getCurrentLoad));
                
        if (bestAgentOpt.isPresent()) {
            return taskService.assignTask(taskId, bestAgentOpt.get().getId());
        }
        
        throw new RuntimeException("Could not auto-assign task");
    }
}
