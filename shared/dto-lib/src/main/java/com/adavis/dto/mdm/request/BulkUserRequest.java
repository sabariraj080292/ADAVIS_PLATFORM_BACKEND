package com.adavis.dto.mdm.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUserRequest {

    private List<CreateUserRequest> users;
    private String operationType;  // CREATE, UPDATE, DELETE
}