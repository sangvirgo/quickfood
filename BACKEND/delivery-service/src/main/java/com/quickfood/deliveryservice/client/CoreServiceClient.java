package com.quickfood.deliveryservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "core-service")
public interface CoreServiceClient {

    @PutMapping("/api/core/orders/{orderId}/delivered")
    void markOrderDelivered(@PathVariable("orderId") Long orderId);
}
