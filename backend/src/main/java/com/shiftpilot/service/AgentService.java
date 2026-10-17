package com.shiftpilot.service;

import com.shiftpilot.api.dto.AgentDto;
import com.shiftpilot.domain.Agent;
import com.shiftpilot.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;

    @Transactional(readOnly = true)
    public List<AgentDto> getAgentsByCompany(UUID companyId) {
        return agentRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AgentDto mapToDto(Agent agent) {
        return AgentDto.builder()
                .id(agent.getId())
                .fullName(agent.getFullName())
                .phone(agent.getPhone())
                .status(agent.getStatus())
                .onShift(agent.isOnShift())
                .currentLoad(agent.getCurrentLoad())
                .build();
    }
}
