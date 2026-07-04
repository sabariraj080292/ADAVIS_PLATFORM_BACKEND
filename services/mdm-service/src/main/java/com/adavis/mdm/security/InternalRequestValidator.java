package com.adavis.mdm.security;

import com.adavis.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class InternalRequestValidator {

    @Value("${security.internal-auth-header:adavis-internal-auth-key}")
    private String internalAuthHeaderValue;

    public void validateInternalGatewayRequest(String internalAuth) {
        if (!internalAuthHeaderValue.equals(internalAuth)) {
            throw new BusinessException("Unauthorized internal request", "UNAUTHORIZED_INTERNAL_REQUEST");
        }
    }
}
