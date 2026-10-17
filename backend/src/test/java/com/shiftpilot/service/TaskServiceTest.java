package com.shiftpilot.service;

import com.shiftpilot.api.dto.TaskDto;
import com.shiftpilot.domain.Agent;
import com.shiftpilot.domain.Company;
import com.shiftpilot.domain.Task;
import com.shiftpilot.realtime.RealtimeBroadcastService;
import com.shiftpilot.repository.AgentRepository;
import com.shiftpilot.repository.AssignmentRepository;
import com.shiftpilot.repository.CompanyRepository;
import com.shiftpilot.repository.StatusEventRepository;
import com.shiftpilot.repository.TaskRepository;
import com.shiftpilot.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private StatusEventRepository statusEventRepository;

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private RealtimeBroadcastService broadcastService;

    @InjectMocks
    private TaskService taskService;

    private UUID taskId;
    private UUID agentId;
    private Company company;
    private Task unassignedTask;
    private Agent agent;

    @BeforeEach
    void setUp() {
        taskId = UUID.randomUUID();
        agentId = UUID.randomUUID();

        company = Company.builder()
                .id(UUID.randomUUID())
                .name("Fast Delivery Co.")
                .build();

        unassignedTask = Task.builder()
                .id(taskId)
                .company(company)
                .referenceCode("TSK-101")
                .customerName("Ahmed")
                .address("Amman, 7th Circle")
                .taskType("Delivery")
                .status("UNASSIGNED")
                .slaDeadline(ZonedDateTime.now().plusHours(1))
                .version(0)
                .build();

        agent = Agent.builder()
                .id(agentId)
                .company(company)
                .fullName("Omar Driver")
                .phone("+962790000001")
                .status("ACTIVE")
                .onShift(true)
                .build();
    }

    @Test
    @DisplayName("Should assign an UNASSIGNED task to an active agent and broadcast event")
    void testAssignTaskSuccess() {
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(unassignedTask));
        when(agentRepository.findById(agentId)).thenReturn(Optional.of(agent));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskDto result = taskService.assignTask(taskId, agentId);

        assertNotNull(result);
        assertEquals("ACCEPTED", result.getStatus());
        verify(assignmentRepository, times(1)).save(any());
        verify(statusEventRepository, times(1)).save(any());
        verify(broadcastService, times(1)).broadcastTaskUpdate(eq(company.getId()), any(TaskDto.class));
    }

    @Test
    @DisplayName("Should prevent double assignment when task is already accepted (Concurrency Protection)")
    void testConcurrentAssignmentFailsWhenAlreadyAccepted() {
        // Task has already been grabbed by another agent/thread
        unassignedTask.setStatus("ACCEPTED");
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(unassignedTask));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.assignTask(taskId, agentId);
        });

        assertTrue(exception.getMessage().contains("Task cannot be assigned in its current state: ACCEPTED"));
        verify(assignmentRepository, never()).save(any());
        verify(broadcastService, never()).broadcastTaskUpdate(any(), any());
    }
}
