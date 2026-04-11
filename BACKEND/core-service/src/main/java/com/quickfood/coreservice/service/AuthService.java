package com.quickfood.coreservice.service;

import com.quickfood.coreservice.client.DeliveryClient;
import com.quickfood.coreservice.dto.auth.LoginRequest;
import com.quickfood.coreservice.dto.auth.LoginResponse;
import com.quickfood.coreservice.dto.auth.RegisterRequest;
import com.quickfood.coreservice.dto.delivery.ShipperProfileRequest;
import com.quickfood.coreservice.entity.Role;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.quickfood.coreservice.entity.User;
import com.quickfood.coreservice.exception.BadRequestException;
import com.quickfood.coreservice.repository.UserRepository;
import com.quickfood.coreservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DeliveryClient deliveryClient;

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        // === AGE VALIDATION ===
        if (request.getDateOfBirth() != null) {
            LocalDate dob = request.getDateOfBirth();
            
            // Không cho ngày sinh trong tương lai
            if (dob.isAfter(LocalDate.now())) {
                throw new BadRequestException("Ngày sinh không hợp lệ");
            }
            
            long age = ChronoUnit.YEARS.between(dob, LocalDate.now());
            
            // Tất cả user phải từ 13 tuổi trở lên
            if (age < 13) {
                throw new BadRequestException("Người dùng phải từ 13 tuổi trở lên");
            }
            
            // Shipper phải từ 18 tuổi trở lên (tuổi lao động)
            if (Role.SHIPPER.equals(request.getRole()) && age < 18) {
                throw new BadRequestException("Shipper phải đủ 18 tuổi trở lên");
            }
        }
        // =====================

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user = userRepository.save(user);

        // If the user is a SHIPPER, create a Shipper profile in delivery-service
        if (Role.SHIPPER.equals(request.getRole())) {
            try {
                ShipperProfileRequest profileRequest = ShipperProfileRequest.builder()
                        .userId(user.getId())
                        .name(user.getName())
                        .phone(request.getPhone() != null ? request.getPhone() : "N/A")
                        .build();
                deliveryClient.createShipperProfile(profileRequest);
                log.info("Shipper profile created in delivery-service for userId: {}", user.getId());
            } catch (Exception e) {
                log.error("Failed to create shipper profile in delivery-service for userId {}: {}", user.getId(), e.getMessage());
                // Don't rollback — user is registered, shipper profile can be created later
            }
        }

        return user;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
