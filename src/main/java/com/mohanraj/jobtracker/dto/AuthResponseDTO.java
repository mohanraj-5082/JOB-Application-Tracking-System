package com.mohanraj.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String tokenType;
    private long expiresIn;
    private String email;
}
