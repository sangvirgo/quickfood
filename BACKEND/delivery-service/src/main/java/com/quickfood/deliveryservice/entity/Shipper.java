package com.quickfood.deliveryservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "shippers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private boolean isBusy = false;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point currentLocation;
}
