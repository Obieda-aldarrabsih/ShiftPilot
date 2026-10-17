package com.shiftpilot.api.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class CreateTaskRequest {
    private String customerName;
    private String customerPhone;
    private String address;
    private String taskType;
    private String notes;
    private ZonedDateTime slaDeadline;
}
