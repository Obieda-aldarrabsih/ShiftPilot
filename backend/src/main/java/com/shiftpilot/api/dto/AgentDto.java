package com.shiftpilot.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AgentDto {
    private UUID id;
    private String fullName;
    private String phone;
    private String status;
    private boolean onShift;
    private Integer currentLoad;
}
