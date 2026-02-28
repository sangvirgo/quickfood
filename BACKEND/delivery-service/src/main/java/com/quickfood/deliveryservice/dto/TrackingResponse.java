package com.quickfood.deliveryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingResponse {
    private Long orderId;
    private String shipperName;
    private String status;
    private Double latitude;
    private Double longitude;
}
