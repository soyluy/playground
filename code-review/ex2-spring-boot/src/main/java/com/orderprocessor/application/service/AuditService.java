package com.orderprocessor.application.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    @PersistenceContext
    private EntityManager em;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEntityChange(String entityType, UUID entityId, String action, String actor, String changes) {
        em.createNativeQuery("""
                        insert into audit_log (entity_type, entity_id, action, actor, changes, occurred_at)
                        values (?, ?, ?, ?, ?, ?)
                        """)
                .setParameter(1, entityType)
                .setParameter(2, entityId)
                .setParameter(3, action)
                .setParameter(4, actor)
                .setParameter(5, changes)
                .setParameter(6, Instant.now())
                .executeUpdate();
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logUserAction(String actor, String action, String details) {
        em.createNativeQuery("""
                        insert into audit_log (entity_type, entity_id, action, actor, changes, occurred_at)
                        values (?, ?, ?, ?, ?, ?)
                        """)
                .setParameter(1, "USER_ACTION")
                .setParameter(2, UUID.randomUUID())
                .setParameter(3, action)
                .setParameter(4, actor)
                .setParameter(5, details)
                .setParameter(6, Instant.now())
                .executeUpdate();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Object[]> getAuditHistory(int limit) {
        return em.createNativeQuery("""
                        select entity_type, entity_id, action, actor, changes, occurred_at
                        from audit_log
                        order by occurred_at desc
                        limit ?
                        """)
                .setParameter(1, limit)
                .getResultList();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Object[]> getAuditByEntityId(UUID entityId) {
        return em.createNativeQuery("""
                        select entity_type, entity_id, action, actor, changes, occurred_at
                        from audit_log
                        where entity_id = ?
                        order by occurred_at desc
                        """)
                .setParameter(1, entityId)
                .getResultList();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Object[]> getAuditByUserId(String userId) {
        return em.createNativeQuery("""
                        select entity_type, entity_id, action, actor, changes, occurred_at
                        from audit_log
                        where actor = ?
                        order by occurred_at desc
                        """)
                .setParameter(1, userId)
                .getResultList();
    }
}
