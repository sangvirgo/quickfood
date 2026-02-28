package com.quickfood.coreservice.client;

import com.quickfood.coreservice.dto.delivery.ShipmentRequest;
import com.quickfood.coreservice.dto.delivery.ShipperProfileRequest;
import com.quickfood.coreservice.dto.delivery.TrackingResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "delivery-service", url = "${delivery.service.url:http://delivery-service:8082}")
public interface DeliveryClient {

    @PostMapping("/api/delivery/shipments")
    void createShipment(@RequestBody ShipmentRequest request);

    @GetMapping("/api/delivery/shipments/{orderId}/tracking")
    TrackingResponse getTracking(@PathVariable("orderId") Long orderId);

    @PostMapping("/api/delivery/shippers/internal/register")
    void createShipperProfile(@RequestBody ShipperProfileRequest request);
}

