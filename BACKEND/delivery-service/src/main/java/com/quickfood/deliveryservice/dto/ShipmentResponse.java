package com.quickfood.deliveryservice.dto;

import com.quickfood.deliveryservice.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private Long shipperId;
    private ShipmentStatus status;
    private String deliveryAddress;
    private Double destinationLat;
    private Double destinationLng;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
}
