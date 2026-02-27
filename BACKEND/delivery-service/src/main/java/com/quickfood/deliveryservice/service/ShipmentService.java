package com.quickfood.deliveryservice.service;

import com.quickfood.deliveryservice.client.CoreServiceClient;
import com.quickfood.deliveryservice.dto.CreateShipmentRequest;
import com.quickfood.deliveryservice.dto.ShipmentResponse;
import com.quickfood.deliveryservice.entity.Shipment;
import com.quickfood.deliveryservice.entity.ShipmentStatus;
import com.quickfood.deliveryservice.entity.Shipper;
import com.quickfood.deliveryservice.repository.ShipmentRepository;
import com.quickfood.deliveryservice.repository.ShipperRepository;
import com.quickfood.deliveryservice.security.UserContext;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipperRepository shipperRepository;
    private final CoreServiceClient coreServiceClient;

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    // ─── Internal: called by core-service ────────────────────────────────────

    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        Point destination = null;
        if (request.getDestinationLat() != null && request.getDestinationLng() != null) {
            destination = GEOMETRY_FACTORY.createPoint(
                    new Coordinate(request.getDestinationLng(), request.getDestinationLat()));
        }

        Shipment shipment = Shipment.builder()
                .orderId(request.getOrderId())
                .status(ShipmentStatus.WAITING)
                .deliveryAddress(request.getDeliveryAddress())
                .destination(destination)
                .build();

        return toResponse(shipmentRepository.save(shipment));
    }

    // ─── SHIPPER: list available ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAvailableShipments() {
        return shipmentRepository.findByStatus(ShipmentStatus.WAITING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ─── SHIPPER: get one ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ShipmentResponse getShipment(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + id));
        return toResponse(shipment);
    }

    // ─── SHIPPER: accept (pessimistic lock) ───────────────────────────────────

    @Transactional
    public ShipmentResponse acceptShipment(Long shipmentId) {
        Long userId = UserContext.getUserId();

        Shipper shipper = shipperRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shipper profile not found for userId: " + userId));

        if (shipper.isBusy()) {
            throw new IllegalStateException("Shipper is already busy with another delivery");
        }

        // PESSIMISTIC_WRITE lock prevents two shippers accepting the same order simultaneously
        Shipment shipment = shipmentRepository.findByIdWithLock(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        if (shipment.getStatus() != ShipmentStatus.WAITING) {
            throw new IllegalStateException("Shipment is no longer available (status: " + shipment.getStatus() + ")");
        }

        shipment.setStatus(ShipmentStatus.DELIVERING);
        shipment.setShipperId(shipper.getId());
        shipment.setAcceptedAt(LocalDateTime.now());

        shipper.setBusy(true);
        shipperRepository.save(shipper);

        return toResponse(shipmentRepository.save(shipment));
    }

    // ─── SHIPPER: complete ────────────────────────────────────────────────────

    @Transactional
    public ShipmentResponse completeShipment(Long shipmentId) {
        Long userId = UserContext.getUserId();

        Shipper shipper = shipperRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shipper profile not found for userId: " + userId));

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + shipmentId));

        if (!shipper.getId().equals(shipment.getShipperId())) {
            throw new IllegalStateException("You are not the assigned shipper for this shipment");
        }

        if (shipment.getStatus() != ShipmentStatus.DELIVERING) {
            throw new IllegalStateException("Shipment is not in DELIVERING status");
        }

        shipment.setStatus(ShipmentStatus.DELIVERED);
        shipment.setCompletedAt(LocalDateTime.now());

        shipper.setBusy(false);
        shipperRepository.save(shipper);

        Shipment saved = shipmentRepository.save(shipment);

        // Notify core-service that order has been delivered
        coreServiceClient.markOrderDelivered(shipment.getOrderId());

        return toResponse(saved);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private ShipmentResponse toResponse(Shipment s) {
        Double lat = null, lng = null;
        if (s.getDestination() != null) {
            lat = s.getDestination().getY();
            lng = s.getDestination().getX();
        }
        return ShipmentResponse.builder()
                .id(s.getId())
                .orderId(s.getOrderId())
                .shipperId(s.getShipperId())
                .status(s.getStatus())
                .deliveryAddress(s.getDeliveryAddress())
                .destinationLat(lat)
                .destinationLng(lng)
                .acceptedAt(s.getAcceptedAt())
                .completedAt(s.getCompletedAt())
                .build();
    }
}
