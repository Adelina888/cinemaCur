package com.cinema.api.enums;


public enum Category {
    SNACKS("Закуски"),
    DRINKS("Напитки"),
    SWEETS("Сладости"),
    OTHER("Прочее");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}