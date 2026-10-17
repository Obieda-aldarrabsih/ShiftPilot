package com.shiftpilot.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class TaskDto {
    private UUID id;
    private String referenceCode;
    private String customerName;
    private String customerPhone;
    private String address;
    private String taskType;
    private String notes;
    private String status;
    private ZonedDateTime slaDeadline;
    private boolean atRisk;
    private boolean breached;
    private ZonedDateTime createdAt;
    private ZonedDateTime completedAt;
    private UUID assignedAgentId;
    private String assignedAgentName;
}
