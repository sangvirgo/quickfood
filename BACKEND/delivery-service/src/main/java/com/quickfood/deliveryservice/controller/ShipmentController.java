package com.quickfood.deliveryservice.controller;

import com.quickfood.deliveryservice.dto.CreateShipmentRequest;
import com.quickfood.deliveryservice.dto.ShipmentResponse;
import com.quickfood.deliveryservice.dto.TrackingResponse;
import com.quickfood.deliveryservice.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    /**
     * INTERNAL — called by core-service (permitAll in SecurityConfig).
     * Creates a new shipment with status WAITING.
     */
    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(@RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shipmentService.createShipment(request));
    }

    /**
     * SHIPPER — list all WAITING shipments available for pickup.
     */
    @GetMapping("/available")
    public ResponseEntity<List<ShipmentResponse>> getAvailable() {
        return ResponseEntity.ok(shipmentService.getAvailableShipments());
    }

    /**
     * SHIPPER — get a specific shipment by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipment(id));
    }

    /**
     * INTERNAL — called by core-service to get tracking info for an order.
     * Uses orderId (NOT shipment ID) to find the shipment.
     */
    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<TrackingResponse> getTracking(@PathVariable Long orderId) {
        return ResponseEntity.ok(shipmentService.getTracking(orderId));
    }

    /**
     * SHIPPER — accept a WAITING shipment (PESSIMISTIC_WRITE lock applied).
     * Transitions WAITING → DELIVERING, marks shipper as busy.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<ShipmentResponse> accept(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.acceptShipment(id));
    }

    /**
     * SHIPPER — complete a DELIVERING shipment.
     * Transitions DELIVERING → DELIVERED, frees shipper, notifies core-service.
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ShipmentResponse> complete(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.completeShipment(id));
    }
}
