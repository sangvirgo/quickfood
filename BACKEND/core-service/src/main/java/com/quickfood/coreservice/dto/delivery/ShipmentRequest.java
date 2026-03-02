package com.quickfood.coreservice.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRequest {
    private Long orderId;
    private Long customerId;
    private String deliveryAddress;     // ✅ Thêm field này
    private Double destinationLat;      // ✅ Thêm field này
    private Double destinationLng;      // ✅ Thêm field này
}
