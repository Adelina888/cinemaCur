package com.cinema.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MovementType {
    INCOME("Приход"),
    SALE("Продажа"),
    RETURN("Возврат"),
    TRANSFER("Перемещение"),
    ADJUST("Корректировка");

    private final String displayName;

    MovementType(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static MovementType fromDisplayName(String displayName) {
        for (MovementType type : MovementType.values()) {
            if (type.displayName.equalsIgnoreCase(displayName)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Неизвестный тип движения: " + displayName);
    }
}