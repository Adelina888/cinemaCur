package com.cinema.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static MerchandiseType fromDisplayName(String displayName) {
        for (MerchandiseType type : MerchandiseType.values()) {
            if (type.displayName.equalsIgnoreCase(displayName)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Неизвестный тип мерча: " + displayName);
    }
}