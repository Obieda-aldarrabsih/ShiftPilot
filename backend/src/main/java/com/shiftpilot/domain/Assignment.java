package com.shiftpilot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime assignedAt = ZonedDateTime.now();

    @Column(name = "assignment_method", nullable = false)
    private String assignmentMethod; // MANUAL, AUTO

    @Column(name = "unassigned_at")
    private ZonedDateTime unassignedAt;
}
