package com.quickfood.deliveryservice.service;

import com.quickfood.deliveryservice.dto.ShipperResponse;
import com.quickfood.deliveryservice.dto.UpdateLocationRequest;
import com.quickfood.deliveryservice.entity.Shipper;
import com.quickfood.deliveryservice.repository.ShipperRepository;
import com.quickfood.deliveryservice.security.UserContext;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShipperService {

    private final ShipperRepository shipperRepository;

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public ShipperResponse updateLocation(UpdateLocationRequest request) {
        Long userId = UserContext.getUserId();

        Shipper shipper = shipperRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shipper profile not found for userId: " + userId));

        Point point = GEOMETRY_FACTORY.createPoint(
                new Coordinate(request.getLng(), request.getLat()));
        shipper.setCurrentLocation(point);

        return toResponse(shipperRepository.save(shipper));
    }

    @Transactional(readOnly = true)
    public ShipperResponse getMe() {
        Long userId = UserContext.getUserId();

        Shipper shipper = shipperRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shipper profile not found for userId: " + userId));

        return toResponse(shipper);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private ShipperResponse toResponse(Shipper s) {
        Double lat = null, lng = null;
        if (s.getCurrentLocation() != null) {
            lat = s.getCurrentLocation().getY();
            lng = s.getCurrentLocation().getX();
        }
        return ShipperResponse.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .name(s.getName())
                .phone(s.getPhone())
                .isBusy(s.isBusy())
                .currentLat(lat)
                .currentLng(lng)
                .build();
    }
}
