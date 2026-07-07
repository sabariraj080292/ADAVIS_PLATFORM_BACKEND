package com.adavis.mdm.validator;

import com.adavis.common.exception.BusinessException;
import com.adavis.mdm.model.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserValidator {

    public void validateCreateUser(UserProfile user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new BusinessException("Username is required", "USERNAME_REQUIRED");
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()
                && !user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BusinessException("Invalid email format", "INVALID_EMAIL");
        }
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new BusinessException("First name is required", "FIRST_NAME_REQUIRED");
        }
    }
}