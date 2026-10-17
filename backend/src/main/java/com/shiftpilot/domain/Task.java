package com.shiftpilot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "reference_code", nullable = false)
    private String referenceCode;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(nullable = false)
    private String address;

    @Column(name = "task_type", nullable = false)
    private String taskType;

    private String notes;

    @Column(nullable = false)
    private String status; // UNASSIGNED, ACCEPTED, EN_ROUTE, ARRIVED, COMPLETED, DECLINED, CANCELLED

    @Column(name = "sla_deadline", nullable = false)
    private ZonedDateTime slaDeadline;

    @Column(name = "at_risk", nullable = false)
    @Builder.Default
    private boolean atRisk = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean breached = false;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    public void transitionTo(String newStatus) {
        // Enforce basic state transitions
        if (this.status.equals("COMPLETED") || this.status.equals("CANCELLED")) {
            throw new IllegalStateException("Cannot transition from terminal state: " + this.status);
        }
        
        // Simple logic for MVP. In reality, enforce strictly (UNASSIGNED -> ACCEPTED -> EN_ROUTE -> ...)
        this.status = newStatus;
        if ("COMPLETED".equals(newStatus)) {
            this.completedAt = ZonedDateTime.now();
        }
    }
}
