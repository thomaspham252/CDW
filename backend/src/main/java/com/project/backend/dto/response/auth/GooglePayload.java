package com.project.backend.dto.response.auth;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GooglePayload {
    private String sub;
    private String email;
    private String name;
    private Boolean emailVerified;
}
