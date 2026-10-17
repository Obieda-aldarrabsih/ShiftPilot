package com.shiftpilot.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TaskStateMachineTest {

    private Task task;

    @BeforeEach
    void setUp() {
        task = Task.builder()
                .referenceCode("TSK-TEST-1")
                .customerName("Jane Doe")
                .address("Amman, Jordan")
                .taskType("Delivery")
                .status("UNASSIGNED")
                .slaDeadline(ZonedDateTime.now().plusHours(2))
                .build();
    }

    @Test
    @DisplayName("Should successfully transition through valid operational lifecycle")
    void testValidLifecycleTransitions() {
        assertEquals("UNASSIGNED", task.getStatus());
        assertNull(task.getCompletedAt());

        // 1. Accept
        task.transitionTo("ACCEPTED");
        assertEquals("ACCEPTED", task.getStatus());
        assertNull(task.getCompletedAt());

        // 2. En Route
        task.transitionTo("EN_ROUTE");
        assertEquals("EN_ROUTE", task.getStatus());

        // 3. Arrived
        task.transitionTo("ARRIVED");
        assertEquals("ARRIVED", task.getStatus());

        // 4. Completed
        task.transitionTo("COMPLETED");
        assertEquals("COMPLETED", task.getStatus());
        assertNotNull(task.getCompletedAt(), "completedAt timestamp should be set upon completion");
    }

    @Test
    @DisplayName("Should throw IllegalStateException when transitioning from COMPLETED terminal state")
    void testTransitionFromCompletedStateFails() {
        task.transitionTo("COMPLETED");

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            task.transitionTo("ACCEPTED");
        });

        assertTrue(exception.getMessage().contains("Cannot transition from terminal state: COMPLETED"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when transitioning from CANCELLED terminal state")
    void testTransitionFromCancelledStateFails() {
        task.transitionTo("CANCELLED");

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            task.transitionTo("EN_ROUTE");
        });

        assertTrue(exception.getMessage().contains("Cannot transition from terminal state: CANCELLED"));
    }
}
