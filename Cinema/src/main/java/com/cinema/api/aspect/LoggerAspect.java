package com.cinema.api.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Aspect
@Component
public class LoggerAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggerAspect.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Логирование всех методов в сервисах
    @Before("execution(* com.cinema.api.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        logger.info("{} | ВЫЗОВ МЕТОДА | {}.{}() | Аргументы: {}",
                LocalDateTime.now().format(formatter),
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(pointcut = "execution(* com.cinema.api.service.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        logger.info("{} | УСПЕШНОЕ ВЫПОЛНЕНИЕ | {}.{}() | Результат: {}",
                LocalDateTime.now().format(formatter),
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                result != null ? result.toString() : "void");
    }

    @AfterThrowing(pointcut = "execution(* com.cinema.api.service.*.*(..))", throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        logger.error("{} | ОШИБКА | {}.{}() | {}",
                LocalDateTime.now().format(formatter),
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(),
                error.getMessage());
    }

    // Специфические методы для бизнес-логирования
    public void logAuthentication(String login, boolean success) {
        logger.info("{} | АУТЕНТИФИКАЦИЯ | Логин: {} | {}",
                LocalDateTime.now().format(formatter), login, success ? "УСПЕШНО" : "ОШИБКА");
    }

    public void logSale(Long adminId, Long receiptId, Double amount) {
        logger.info("{} | ПРОДАЖА | Админ: {} | Чек: {} | Сумма: {} руб.",
                LocalDateTime.now().format(formatter), adminId, receiptId, amount);
    }

    public void logReturn(Long adminId, Long receiptId, Double amount) {
        logger.info("{} | ВОЗВРАТ | Админ: {} | Чек: {} | Сумма: {} руб.",
                LocalDateTime.now().format(formatter), adminId, receiptId, amount);
    }

    public void logProductCreate(Long adminId, String productName) {
        logger.info("{} | СОЗДАНИЕ ТОВАРА | Админ: {} | Товар: {}",
                LocalDateTime.now().format(formatter), adminId, productName);
    }

    public void logProductUpdate(Long adminId, String productName) {
        logger.info("{} | ИЗМЕНЕНИЕ ТОВАРА | Админ: {} | Товар: {}",
                LocalDateTime.now().format(formatter), adminId, productName);
    }

    public void logProductDelete(Long adminId, Long productId) {
        logger.info("{} | УДАЛЕНИЕ ТОВАРА | Админ: {} | ID товара: {}",
                LocalDateTime.now().format(formatter), adminId, productId);
    }

    public void logPriceChange(Long adminId, Long productId, Double oldPrice, Double newPrice) {
        logger.info("{} | ИЗМЕНЕНИЕ ЦЕНЫ | Админ: {} | Товар ID: {} | Было: {} | Стало: {}",
                LocalDateTime.now().format(formatter), adminId, productId, oldPrice, newPrice);
    }

    public void logStockChange(Long adminId, Long productId, Integer oldQty, Integer newQty, String location) {
        logger.info("{} | КОРРЕКТИРОВКА ОСТАТКОВ | Админ: {} | Товар ID: {} | Локация: {} | Было: {} | Стало: {}",
                LocalDateTime.now().format(formatter), adminId, productId, location, oldQty, newQty);
    }

    public void logExpirationWarning(String productName, Integer daysLeft) {
        logger.warn("{} | ПРЕДУПРЕЖДЕНИЕ | Товар: {} | Истекает через {} дней",
                LocalDateTime.now().format(formatter), productName, daysLeft);
    }
}