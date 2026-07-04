package com.adavis.dto.license.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private String licenseKey;
    private List<String> modules;
    private String status;
}