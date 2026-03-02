package com.quickfood.coreservice.dto.order;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String deliveryAddress;  // Thêm field này
    private List<OrderItemRequest> items;
}
