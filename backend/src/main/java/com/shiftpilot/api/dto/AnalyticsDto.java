package com.shiftpilot.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AnalyticsDto {
    private long totalTasks;
    private long completedTasks;
    private long activeTasks;
    private long unassignedTasks;
    private Map<String, Long> tasksByStatus;
    private double completionRate;
}
