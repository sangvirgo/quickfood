package com.quickfood.coreservice.dto.order;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Data
public class OrderRequest {
    @NotBlank
    private String deliveryAddress;  // Thêm field này
    private List<OrderItemRequest> items;
}
