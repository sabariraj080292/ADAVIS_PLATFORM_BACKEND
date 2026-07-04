package com.adavis.auth.service;

import com.adavis.common.exception.BusinessException;
import lombok.Builder;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PasswordPolicyService {

    private static final Pattern UPPERCASE = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE = Pattern.compile(".*[a-z].*");
    private static final Pattern NUMBERS = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL = Pattern.compile(".*[^A-Za-z0-9].*");

    @Value("${password.policy.min-length:8}")
    private int minLength;

    @Value("${password.policy.require-uppercase:true}")
    private boolean requireUppercase;

    @Value("${password.policy.require-lowercase:true}")
    private boolean requireLowercase;

    @Value("${password.policy.require-numbers:true}")
    private boolean requireNumbers;

    @Value("${password.policy.require-special:true}")
    private boolean requireSpecial;

    @Value("${password.policy.history-count:5}")
    private int historyCount;

    public void validateOrThrow(String password) {
        List<String> errors = validateAndCollectErrors(password);
        if (!errors.isEmpty()) {
            throw new BusinessException("Password policy violation: " + String.join("; ", errors), "PASSWORD_POLICY_VIOLATION");
        }
    }

    public List<String> validateAndCollectErrors(String password) {
        List<String> errors = new ArrayList<>();
        String value = password == null ? "" : password;

        if (value.length() < minLength) {
            errors.add("Minimum length is " + minLength);
        }
        if (requireUppercase && !UPPERCASE.matcher(value).matches()) {
            errors.add("At least one uppercase letter is required");
        }
        if (requireLowercase && !LOWERCASE.matcher(value).matches()) {
            errors.add("At least one lowercase letter is required");
        }
        if (requireNumbers && !NUMBERS.matcher(value).matches()) {
            errors.add("At least one number is required");
        }
        if (requireSpecial && !SPECIAL.matcher(value).matches()) {
            errors.add("At least one special character is required");
        }

        return errors;
    }

    public PasswordPolicyInfo getPolicyInfo() {
        return PasswordPolicyInfo.builder()
                .minLength(minLength)
                .requireUppercase(requireUppercase)
                .requireLowercase(requireLowercase)
                .requireNumbers(requireNumbers)
                .requireSpecial(requireSpecial)
                .historyCount(historyCount)
                .build();
    }

    @Getter
    @Builder
    public static class PasswordPolicyInfo {
        private int minLength;
        private boolean requireUppercase;
        private boolean requireLowercase;
        private boolean requireNumbers;
        private boolean requireSpecial;
        private int historyCount;
    }
}
