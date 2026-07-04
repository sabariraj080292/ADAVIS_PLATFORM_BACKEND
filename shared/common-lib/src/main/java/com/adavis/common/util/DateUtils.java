package com.adavis.common.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private DateUtils() {}

    public static final String DEFAULT_TIMEZONE = "UTC";
    public static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    public static final DateTimeFormatter HUMAN_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static Instant now() {
        return Instant.now();
    }

    public static String formatIso(Instant instant) {
        return instant != null ? ISO_FORMATTER.format(instant) : null;
    }

    public static String formatHuman(Instant instant) {
        return instant != null
                ? HUMAN_FORMATTER.format(instant.atZone(ZoneId.of(DEFAULT_TIMEZONE)))
                : null;
    }

    public static Instant parseIso(String isoString) {
        return isoString != null ? Instant.parse(isoString) : null;
    }
}   