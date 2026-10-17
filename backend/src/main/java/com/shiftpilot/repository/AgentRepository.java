package com.shiftpilot.repository;

import com.shiftpilot.domain.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentRepository extends JpaRepository<Agent, UUID> {
    List<Agent> findByCompanyId(UUID companyId);
    Optional<Agent> findByCompanyIdAndPhone(UUID companyId, String phone);
    List<Agent> findByCompanyIdAndStatusAndOnShiftTrue(UUID companyId, String status);
}
