package com.adavis.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginInitiateResponse {

    private String userId;
    private String email;
    private String status;
    private Boolean passwordSet;
}
