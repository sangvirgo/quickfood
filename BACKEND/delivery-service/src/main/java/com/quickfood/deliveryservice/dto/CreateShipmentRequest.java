package com.quickfood.deliveryservice.dto;

import lombok.Data;

@Data
public class CreateShipmentRequest {
    private Long orderId;
    private String deliveryAddress;
    private Double destinationLat;
    private Double destinationLng;
}
