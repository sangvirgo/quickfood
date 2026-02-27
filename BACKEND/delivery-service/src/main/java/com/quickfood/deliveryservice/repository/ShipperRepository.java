package com.quickfood.deliveryservice.repository;

import com.quickfood.deliveryservice.entity.Shipper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, Long> {

    Optional<Shipper> findByUserId(Long userId);
}
