package com.shiftpilot.repository;

import com.shiftpilot.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByCompanyId(UUID companyId);
    Optional<Task> findByCompanyIdAndReferenceCode(UUID companyId, String referenceCode);
    List<Task> findByCompanyIdAndStatusIn(UUID companyId, List<String> statuses);
    
    List<Task> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);
}
