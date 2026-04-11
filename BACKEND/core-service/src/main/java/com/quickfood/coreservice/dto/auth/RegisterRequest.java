package com.quickfood.coreservice.dto.auth;

import com.quickfood.coreservice.entity.Role;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
    private String phone; // used when role=SHIPPER to create Shipper profile
    private LocalDate dateOfBirth;
}
