package com.quickfood.deliveryservice.controller;

import com.quickfood.deliveryservice.dto.ShipperResponse;
import com.quickfood.deliveryservice.dto.UpdateLocationRequest;
import com.quickfood.deliveryservice.service.ShipperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery/shippers")
@RequiredArgsConstructor
public class ShipperController {

    private final ShipperService shipperService;

    /**
     * SHIPPER — update current GPS location into PostGIS.
     */
    @PutMapping("/me/location")
    public ResponseEntity<ShipperResponse> updateLocation(@RequestBody UpdateLocationRequest request) {
        return ResponseEntity.ok(shipperService.updateLocation(request));
    }

    /**
     * SHIPPER — fetch own profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ShipperResponse> getMe() {
        return ResponseEntity.ok(shipperService.getMe());
    }
}
