package com.quickfood.deliveryservice.controller;

import com.quickfood.deliveryservice.dto.RegisterShipperRequest;
import com.quickfood.deliveryservice.dto.ShipperResponse;
import com.quickfood.deliveryservice.dto.UpdateLocationRequest;
import com.quickfood.deliveryservice.service.ShipperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/delivery/shippers")
@RequiredArgsConstructor
public class ShipperController {

    private final ShipperService shipperService;

    /**
     * INTERNAL — called by core-service on SHIPPER user registration.
     * Permitted in SecurityConfig without auth.
     */
    @PostMapping("/internal/register")
    public ResponseEntity<ShipperResponse> internalRegister(@RequestBody RegisterShipperRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shipperService.registerShipper(request));
    }

    /**
     * SHIPPER — update their GPS location.
     */
    @PutMapping("/me/location")
    public ResponseEntity<ShipperResponse> updateLocation(@Valid @RequestBody UpdateLocationRequest request) {
        return ResponseEntity.ok(shipperService.updateLocation(request));
    }

    /**
     * SHIPPER — get their own profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ShipperResponse> getMe() {
        return ResponseEntity.ok(shipperService.getMe());
    }
}
