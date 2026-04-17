package com.orderprocessor.infrastructure.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<AuditEntity, Long> {

    List<AuditEntity> findByEntityIdOrderByOccurredAtDesc(UUID entityId);

    List<AuditEntity> findByActorOrderByOccurredAtDesc(String actor);

    List<AuditEntity> findByEntityTypeAndOccurredAtAfter(String entityType, Instant after, Pageable pageable);
}
