package com.adavis.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponse {

    private String userId;
    private String username;
    private String email;
    private String status;
    private String firstName;
    private String lastName;
}
