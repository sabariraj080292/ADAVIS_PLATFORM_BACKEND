package com.adavis.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLookupResponse {

    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String status;
}