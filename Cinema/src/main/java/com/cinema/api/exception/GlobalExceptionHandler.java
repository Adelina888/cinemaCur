package com.cinema.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Обработка валидации @Valid (аннотации в DTO)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    // Обработка кастомного ValidationError
    @ExceptionHandler(ValidationError.class)
    public ResponseEntity<Map<String, String>> handleValidationError(ValidationError ex) {
        Map<String, String> error = new HashMap<>();
        error.put("field", ex.getField());
        error.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    // Обработка недостатка остатков (для будущих сценариев)
    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientStock(InsufficientStockException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Insufficient stock");
        error.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    // Обработка просроченного товара
    @ExceptionHandler(ExpiredProductException.class)
    public ResponseEntity<Map<String, String>> handleExpiredProduct(ExpiredProductException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Expired product");
        error.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    // Общий обработчик для непредвиденных ошибок
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}