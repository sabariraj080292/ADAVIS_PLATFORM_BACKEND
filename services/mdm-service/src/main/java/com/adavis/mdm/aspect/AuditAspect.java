package com.adavis.mdm.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class AuditAspect {

    @Before("@annotation(com.adavis.common.annotation.AuditLog)")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Audit - Before: {}", joinPoint.getSignature().getName());
    }

    @AfterReturning(pointcut = "@annotation(com.adavis.common.annotation.AuditLog)", returning = "result")
    public void logAfter(JoinPoint joinPoint, Object result) {
        log.info("Audit - After: {} - Result: {}", joinPoint.getSignature().getName(), result);
    }
}