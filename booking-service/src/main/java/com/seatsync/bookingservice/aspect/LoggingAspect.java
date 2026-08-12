package com.seatsync.bookingservice.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.seatsync.bookingservice.service.*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        
        log.info("AOP-LOG [START]: Method {} called with arguments: {}", methodName, Arrays.toString(args));
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long elapsedTime = System.currentTimeMillis() - startTime;
            log.info("AOP-LOG [SUCCESS]: Method {} returned: {} in {}ms", methodName, result, elapsedTime);
            return result;
        } catch (Throwable t) {
            long elapsedTime = System.currentTimeMillis() - startTime;
            log.error("AOP-LOG [FAILURE]: Method {} failed with exception: {} after {}ms", methodName, t.getMessage(), elapsedTime);
            throw t;
        }
    }
}
