package com.quickfood.coreservice.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipperProfileRequest {
    private Long userId;
    private String name;
    private String phone;
}
