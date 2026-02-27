package com.quickfood.deliveryservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipperResponse {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private boolean isBusy;
    private Double currentLat;
    private Double currentLng;
}
