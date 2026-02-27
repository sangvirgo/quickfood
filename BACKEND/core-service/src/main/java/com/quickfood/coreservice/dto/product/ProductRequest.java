package com.quickfood.coreservice.dto.product;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
}
