package com.quickfood.coreservice.service;

import com.quickfood.coreservice.client.DeliveryClient;
import com.quickfood.coreservice.dto.delivery.ShipmentRequest;
import com.quickfood.coreservice.dto.delivery.TrackingResponse;
import com.quickfood.coreservice.dto.order.OrderItemRequest;
import com.quickfood.coreservice.dto.order.OrderItemResponse;
import com.quickfood.coreservice.dto.order.OrderRequest;
import com.quickfood.coreservice.dto.order.OrderResponse;
import com.quickfood.coreservice.entity.Order;
import com.quickfood.coreservice.entity.OrderItem;
import com.quickfood.coreservice.entity.OrderStatus;
import com.quickfood.coreservice.entity.Product;
import com.quickfood.coreservice.exception.BadRequestException;
import com.quickfood.coreservice.exception.ResourceNotFoundException;
import com.quickfood.coreservice.repository.OrderItemRepository;
import com.quickfood.coreservice.repository.OrderRepository;
import com.quickfood.coreservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final DeliveryClient deliveryClient;

    @Transactional
    public OrderResponse createOrder(Long customerId, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must have at least one item");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        // Save the order first to get the generated ID
        Order order = Order.builder()
                .customerId(customerId)
                .totalPrice(BigDecimal.ZERO) // will update after items
                .status(OrderStatus.PENDING)
                .build();
        order = orderRepository.save(order);

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + itemReq.getProductId()));

            if (!product.isAvailable()) {
                throw new BadRequestException("Product is not available: " + product.getName());
            }

            if (product.getStock() < itemReq.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStock() + ", Requested: " + itemReq.getQuantity());
            }

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalPrice = totalPrice.add(subtotal);

            OrderItem item = OrderItem.builder()
                    .orderId(order.getId())
                    .productId(product.getId())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            orderItems.add(orderItemRepository.save(item));
        }

        // Update total price
        order.setTotalPrice(totalPrice);
        order = orderRepository.save(order);

        return toResponse(order, orderItems);
    }

    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(order -> toResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .toList();
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = findOrder(orderId);
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    public List<OrderResponse> getPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.PENDING)
                .stream()
                .map(order -> toResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .toList();
    }

    @Transactional
    public OrderResponse markReady(Long orderId) {
        Order order = findOrder(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order is not in PENDING status: " + orderId);
        }

        order.setStatus(OrderStatus.READY);
        order = orderRepository.save(order);

        // Notify delivery service to create shipment
        try {
            ShipmentRequest shipmentRequest = ShipmentRequest.builder()
                    .orderId(order.getId())
                    .customerId(order.getCustomerId())
                    .build();
            deliveryClient.createShipment(shipmentRequest);
        } catch (Exception e) {
            log.error("Failed to create shipment for order {}: {}", orderId, e.getMessage());
            // Don't rollback — order is already READY, delivery will retry
        }

        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    @Transactional
    public OrderResponse markDelivered(Long orderId) {
        Order order = findOrder(orderId);
        order.setStatus(OrderStatus.DELIVERED);
        order = orderRepository.save(order);
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    public TrackingResponse getTracking(Long orderId) {
        // Ensure order exists
        findOrder(orderId);
        return deliveryClient.getTracking(orderId);
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> {
                    String productName = productRepository.findById(item.getProductId())
                            .map(Product::getName)
                            .orElse("Unknown");
                    return OrderItemResponse.builder()
                            .id(item.getId())
                            .productId(item.getProductId())
                            .productName(productName)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build();
                })
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
