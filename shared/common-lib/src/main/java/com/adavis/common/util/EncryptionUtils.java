package com.adavis.common.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class EncryptionUtils {

    private static final PasswordEncoder encoder = new BCryptPasswordEncoder(10);

    private EncryptionUtils() {}

    public static String encode(String raw) {
        return encoder.encode(raw);
    }

    public static boolean matches(String raw, String encoded) {
        if (raw == null || encoded == null) {
            return false;
        }
        return encoder.matches(raw, encoded);
    }
}