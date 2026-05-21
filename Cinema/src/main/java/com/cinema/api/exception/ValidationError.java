package com.cinema.api.exception;

public class ValidationError extends RuntimeException {
    private final String field;
    private final String message;

    public ValidationError(String field, String message) {
        super(message);
        this.field = field;
        this.message = message;
    }

    public String getField() { return field; }
    public String getMessage() { return message; }
}
