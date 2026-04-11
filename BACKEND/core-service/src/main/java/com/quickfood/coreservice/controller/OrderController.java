package com.quickfood.coreservice.controller;

import com.quickfood.coreservice.dto.delivery.TrackingResponse;
import com.quickfood.coreservice.dto.order.OrderRequest;
import com.quickfood.coreservice.dto.order.OrderResponse;
import com.quickfood.coreservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/core/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * CUSTOMER creates an order.
     * customerId is read from the X-User-Id header forwarded by the gateway.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-User-Id") Long customerId,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(customerId, request));
    }

    /**
     * CUSTOMER views their own order history.
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    /**
     * STAFF views all PENDING orders.
     * NOTE: This mapping must come BEFORE /{id} to avoid ambiguity.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<OrderResponse>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getPendingOrders());
    }

    /**
     * CUSTOMER or STAFF views a specific order.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * STAFF marks order as READY and triggers delivery shipment creation.
     */
    @PutMapping("/{id}/ready")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<OrderResponse> markReady(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.markReady(id));
    }

    /**
     * INTERNAL — called by delivery-service when shipment is completed.
     * Transitions order status to DELIVERED.
     */
    @PutMapping("/{orderId}/delivered")
    public ResponseEntity<OrderResponse> markDelivered(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.markDelivered(orderId));
    }

    /**
     * CUSTOMER tracks their shipment via delivery-service.
     */
    @GetMapping("/{id}/tracking")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<TrackingResponse> getTracking(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getTracking(id));
    }
}
