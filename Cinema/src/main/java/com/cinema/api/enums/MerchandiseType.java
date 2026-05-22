package com.cinema.api.enums;

public enum MerchandiseType {
    TSHIRT("Футболка"),
    MUG("Кружка"),
    TOY("Игрушка"),
    KEYCHAIN("Брелок"),
    OTHER("Прочее");

    private final String displayName;

    MerchandiseType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}