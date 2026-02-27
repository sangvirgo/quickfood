package com.quickfood.coreservice.service;

import com.quickfood.coreservice.dto.product.ProductRequest;
import com.quickfood.coreservice.dto.product.ProductResponse;
import com.quickfood.coreservice.entity.Product;
import com.quickfood.coreservice.exception.ResourceNotFoundException;
import com.quickfood.coreservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllAvailable() {
        return productRepository.findByIsAvailableTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getById(Long id) {
        Product product = findActiveProduct(id);
        return toResponse(product);
    }

    public ProductResponse create(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .isAvailable(true)
                .build();
        return toResponse(productRepository.save(product));
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findActiveProduct(id);
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        return toResponse(productRepository.save(product));
    }

    public void softDelete(Long id) {
        Product product = findActiveProduct(id);
        product.setAvailable(false);
        productRepository.save(product);
    }

    private Product findActiveProduct(Long id) {
        return productRepository.findById(id)
                .filter(Product::isAvailable)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .isAvailable(product.isAvailable())
                .build();
    }
}
