package com.adavis.mdm.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {

    @Builder.Default
    private String theme = "light";

    @Builder.Default
    private String language = "en-US";

    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Builder.Default
    private String dashboardLayout = "standard";

    private List<String> dashboardWidgets;

    @Builder.Default
    private Integer autoRefreshInterval = 10;

    @Builder.Default
    private String defaultReportFormat = "PDF";

    @Builder.Default
    private Integer defaultPageSize = 20;

    @Builder.Default
    private Boolean emailDigestEnabled = false;

    private String emailDigestFrequency;
}