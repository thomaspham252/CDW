package com.project.backend.service.auth;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.project.backend.dto.response.auth.GooglePayload;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {
    @Value("${google.client.id}")
    private String googleClientId;

    public GooglePayload verify(String idTokenString) {
        try {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken == null) {
            throw new RuntimeException("Token Google không hợp lệ");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        return GooglePayload.builder()
                .sub(payload.getSubject())
                .email(payload.getEmail())
                .name((String) payload.get("name"))
                .emailVerified(payload.getEmailVerified())
                .build();

    } catch (Exception e) {
        throw new RuntimeException("Verify Google token thất bại: " + e.getMessage());
    }
}
}
