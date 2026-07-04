package com.adavis.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConditionalOnMissingBean(PasswordEncoder.class)
public class PasswordEncoderConfig {

    private static final int BCRYPT_STRENGTH = 10;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH);
    }

    public static String encode(String rawPassword) {
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH).encode(rawPassword);
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH).matches(rawPassword, encodedPassword);
    }
}