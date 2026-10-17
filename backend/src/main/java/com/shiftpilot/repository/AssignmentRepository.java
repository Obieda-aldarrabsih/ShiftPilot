package com.shiftpilot.repository;

import com.shiftpilot.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    Optional<Assignment> findByTaskIdAndUnassignedAtIsNull(UUID taskId);
    List<Assignment> findByAgentIdAndUnassignedAtIsNull(UUID agentId);
}
