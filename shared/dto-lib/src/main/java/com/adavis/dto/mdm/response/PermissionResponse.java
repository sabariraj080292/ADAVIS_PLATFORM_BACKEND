package com.adavis.dto.mdm.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {

    private String userId;
    private String username;
    private List<String> roles;
    private List<String> groups;
    private List<ScreenPermission> screenPermissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScreenPermission {
        private String screenId;
        private String screenName;
        private String moduleId;
        private List<String> actions;
    }
}