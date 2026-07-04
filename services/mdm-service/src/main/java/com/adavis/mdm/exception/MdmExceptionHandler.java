package com.adavis.mdm.exception;

import com.adavis.common.dto.ApiResponse;
import com.adavis.common.exception.BusinessException;
import com.adavis.common.exception.ResourceNotFoundException;
import com.adavis.common.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@RestControllerAdvice
public class MdmExceptionHandler {

        private static final Pattern DUPLICATE_FIELD_PATTERN = Pattern.compile("dup key: \\{\\s*(?:\"?([^:\\s\"]+)\"?)");

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.warn("Business exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), "RESOURCE_NOT_FOUND"));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed: " + errors, "VALIDATION_ERROR"));
    }

        @ExceptionHandler(MissingRequestHeaderException.class)
        public ResponseEntity<ApiResponse<Void>> handleMissingRequestHeaderException(MissingRequestHeaderException ex) {
                log.warn("Missing header: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage(), "MISSING_HEADER"));
        }

        @ExceptionHandler(MissingServletRequestPartException.class)
        public ResponseEntity<ApiResponse<Void>> handleMissingRequestPartException(MissingServletRequestPartException ex) {
                log.warn("Missing multipart request part: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage(), "MISSING_REQUEST_PART"));
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiResponse<Void>> handleMissingRequestParameterException(MissingServletRequestParameterException ex) {
                log.warn("Missing request parameter: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage(), "MISSING_REQUEST_PARAMETER"));
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNoResourceFoundException(NoResourceFoundException ex) {
                log.warn("Endpoint not found: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage(), "ENDPOINT_NOT_FOUND"));
        }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateKeyException(DuplicateKeyException ex) {
        String message = buildDuplicateMessage(ex);
        log.warn("Duplicate key violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message, "DUPLICATE_RESOURCE"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String rootMessage = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        if (rootMessage != null && rootMessage.contains("E11000")) {
            String message = buildDuplicateMessage(ex);
            log.warn("Duplicate key violation: {}", rootMessage);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(message, "DUPLICATE_RESOURCE"));
        }

        log.warn("Data integrity violation: {}", rootMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Data integrity violation", "DATA_INTEGRITY_VIOLATION"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred", "INTERNAL_ERROR"));
    }

        private String buildDuplicateMessage(Exception ex) {
                String raw = ex.getMessage() != null ? ex.getMessage() : "Duplicate value violates unique constraint";
                String field = extractDuplicateField(raw);
                if (field != null && !field.isBlank()) {
                        return field + " already exists";
                }
                return "Duplicate value violates unique constraint";
        }

        private String extractDuplicateField(String raw) {
                if (raw == null) {
                        return null;
                }
                Matcher matcher = DUPLICATE_FIELD_PATTERN.matcher(raw);
                if (matcher.find()) {
                        String field = matcher.group(1);
                        if (field != null) {
                                return field.replaceAll("_1$", "");
                        }
                }
                return null;
        }
}