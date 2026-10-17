package com.shiftpilot.service;

import com.shiftpilot.api.dto.CreateTaskRequest;
import com.shiftpilot.api.dto.TaskDto;
import com.shiftpilot.api.dto.AnalyticsDto;
import com.shiftpilot.domain.Agent;
import com.shiftpilot.domain.Assignment;
import com.shiftpilot.domain.Company;
import com.shiftpilot.domain.StatusEvent;
import com.shiftpilot.domain.Task;
import com.shiftpilot.domain.User;
import com.shiftpilot.repository.AgentRepository;
import com.shiftpilot.repository.AssignmentRepository;
import com.shiftpilot.repository.CompanyRepository;
import com.shiftpilot.repository.StatusEventRepository;
import com.shiftpilot.repository.TaskRepository;
import com.shiftpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;
import com.shiftpilot.realtime.RealtimeBroadcastService;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final AssignmentRepository assignmentRepository;
    private final StatusEventRepository statusEventRepository;
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RealtimeBroadcastService broadcastService;

    @Transactional
    public TaskDto createTask(UUID companyId, CreateTaskRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Task task = Task.builder()
                .company(company)
                .referenceCode("TSK-" + System.currentTimeMillis() % 100000)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .address(request.getAddress())
                .taskType(request.getTaskType())
                .notes(request.getNotes())
                .status("UNASSIGNED")
                .slaDeadline(request.getSlaDeadline() != null ? request.getSlaDeadline() : ZonedDateTime.now().plusMinutes(company.getDefaultSlaMinutes()))
                .build();

        task = taskRepository.save(task);

        StatusEvent event = StatusEvent.builder()
                .task(task)
                .toStatus("UNASSIGNED")
                .build();
        statusEventRepository.save(event);

        TaskDto dto = mapToDto(task);
        broadcastService.broadcastTaskUpdate(companyId, dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByCompany(UUID companyId) {
        return taskRepository.findByCompanyId(companyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getAgentTasks(UUID agentId) {
        List<Assignment> assignments = assignmentRepository.findByAgentIdAndUnassignedAtIsNull(agentId);
        return assignments.stream()
                .map(Assignment::getTask)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDto assignTask(UUID taskId, UUID agentId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getStatus().equals("UNASSIGNED") && !task.getStatus().equals("DECLINED")) {
            throw new RuntimeException("Task cannot be assigned in its current state: " + task.getStatus());
        }

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        // Optimistic locking happens automatically on task save if we increment version or change field
        task.transitionTo("ACCEPTED");
        task = taskRepository.save(task);

        Assignment assignment = Assignment.builder()
                .task(task)
                .agent(agent)
                .assignmentMethod("MANUAL")
                .build();
        assignmentRepository.save(assignment);

        StatusEvent event = StatusEvent.builder()
                .task(task)
                .fromStatus("UNASSIGNED")
                .toStatus("ACCEPTED")
                .changedBy(agent.getId())
                .build();
        statusEventRepository.save(event);

        TaskDto dto = mapToDto(task);
        broadcastService.broadcastTaskUpdate(task.getCompany().getId(), dto);
        return dto;
    }

    @Transactional
    public TaskDto updateTaskStatus(UUID taskId, String newStatus, UUID agentId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String oldStatus = task.getStatus();
        task.transitionTo(newStatus);
        task = taskRepository.save(task);

        StatusEvent event = StatusEvent.builder()
                .task(task)
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .changedBy(agentId)
                .build();
        statusEventRepository.save(event);

        TaskDto dto = mapToDto(task);
        broadcastService.broadcastTaskUpdate(task.getCompany().getId(), dto);
        return dto;
    }

    public AnalyticsDto getAnalytics(UUID companyId) {
        List<Task> allTasks = taskRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        
        long total = allTasks.size();
        Map<String, Long> tasksByStatus = allTasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
            
        long completed = tasksByStatus.getOrDefault("COMPLETED", 0L);
        long unassigned = tasksByStatus.getOrDefault("UNASSIGNED", 0L);
        long active = total - completed - unassigned - tasksByStatus.getOrDefault("CANCELLED", 0L);
        
        double completionRate = total > 0 ? (double) completed / total * 100.0 : 0.0;
        
        return AnalyticsDto.builder()
                .totalTasks(total)
                .completedTasks(completed)
                .activeTasks(active)
                .unassignedTasks(unassigned)
                .tasksByStatus(tasksByStatus)
                .completionRate(completionRate)
                .build();
    }

    private TaskDto mapToDto(Task task) {
        Assignment activeAssignment = assignmentRepository.findByTaskIdAndUnassignedAtIsNull(task.getId()).orElse(null);
        
        return TaskDto.builder()
                .id(task.getId())
                .referenceCode(task.getReferenceCode())
                .customerName(task.getCustomerName())
                .customerPhone(task.getCustomerPhone())
                .address(task.getAddress())
                .taskType(task.getTaskType())
                .notes(task.getNotes())
                .status(task.getStatus())
                .slaDeadline(task.getSlaDeadline())
                .atRisk(task.isAtRisk())
                .breached(task.isBreached())
                .createdAt(task.getCreatedAt())
                .completedAt(task.getCompletedAt())
                .assignedAgentId(activeAssignment != null ? activeAssignment.getAgent().getId() : null)
                .assignedAgentName(activeAssignment != null ? activeAssignment.getAgent().getFullName() : null)
                .build();
    }
}
