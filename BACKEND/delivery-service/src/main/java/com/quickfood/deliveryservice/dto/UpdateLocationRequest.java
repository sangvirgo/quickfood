package com.quickfood.deliveryservice.dto;

import lombok.Data;

@Data
public class UpdateLocationRequest {
    private Double lat;
    private Double lng;
}
