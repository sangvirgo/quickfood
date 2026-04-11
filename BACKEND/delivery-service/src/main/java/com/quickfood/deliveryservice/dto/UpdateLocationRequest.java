package com.quickfood.deliveryservice.dto;

import lombok.Data;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Data
public class UpdateLocationRequest {
    @NotNull
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double lat;
    
    @NotNull  
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double lng;
}
