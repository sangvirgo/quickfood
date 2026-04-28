import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/network/dio_client.dart';

class CustomerHomeScreen extends StatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  State<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends State<CustomerHomeScreen> {
  final List<Map<String, dynamic>> _products = [];
  final List<Map<String, dynamic>> _cartItems = [];

  String _deliveryAddress = '';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _loading = true;
    });

    try {
      final response = await DioClient.instance.get('/api/core/products');
      final data = response.data;
      if (data is List) {
        _products
          ..clear()
          ..addAll(
            data.whereType<Map>().map(
              (item) => Map<String, dynamic>.from(item),
            ),
          );
      }
    } on DioException catch (e) {
      _showError(DioClient.handleError(e));
    } catch (_) {
      _showError('Có lỗi xảy ra');
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  String _formatPrice(dynamic value) {
    final price = (value is num) ? value : 0;
    return '${NumberFormat('#,###', 'vi_VN').format(price)} đ';
  }

  int _cartCount() {
    return _cartItems.fold<int>(
      0,
      (sum, item) => sum + (item['quantity'] as int? ?? 0),
    );
  }

  Map<String, dynamic>? _findCartItem(Map<String, dynamic> product) {
    final productId = product['id']?.toString();
    for (final item in _cartItems) {
      final itemProduct = item['product'] as Map<String, dynamic>;
      if (itemProduct['id']?.toString() == productId) {
        return item;
      }
    }
    return null;
  }

  void _addToCart(Map<String, dynamic> product) {
    final existing = _findCartItem(product);
    setState(() {
      if (existing != null) {
        existing['quantity'] = (existing['quantity'] as int? ?? 0) + 1;
      } else {
        _cartItems.add({'product': product, 'quantity': 1});
      }
    });
  }

  void _removeFromCart(Map<String, dynamic> product) {
    final existing = _findCartItem(product);
    if (existing == null) {
      return;
    }
    setState(() {
      final currentQty = existing['quantity'] as int? ?? 0;
      if (currentQty <= 1) {
        _cartItems.remove(existing);
      } else {
        existing['quantity'] = currentQty - 1;
      }
    });
  }

  Future<void> _placeOrder() async {
    if (_deliveryAddress.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập địa chỉ giao hàng'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    try {
      final payload = {
        'deliveryAddress': _deliveryAddress.trim(),
        'items': _cartItems
            .map(
              (item) => {
                'productId': (item['product'] as Map<String, dynamic>)['id'],
                'quantity': item['quantity'],
              },
            )
            .toList(),
      };

      await DioClient.instance.post('/api/core/orders', data: payload);

      if (!mounted) {
        return;
      }
      setState(() {
        _cartItems.clear();
        _deliveryAddress = '';
      });
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đặt hàng thành công!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      if (!mounted) {
        return;
      }
      context.push('/orders');
    } on DioException catch (e) {
      _showError(DioClient.handleError(e));
    } catch (_) {
      _showError('Có lỗi xảy ra');
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFFEF4444),
      ),
    );
  }

  void _openCheckoutSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFFFFFFFF),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        bool placing = false;
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Xác nhận đơn hàng',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  ..._cartItems.asMap().entries.map((entry) {
                    final product =
                        entry.value['product'] as Map<String, dynamic>;
                    final quantity = entry.value['quantity'] as int? ?? 0;
                    return Padding(
                      key: ValueKey(product['id'] ?? entry.key),
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${product['name'] ?? ''} x$quantity',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(_formatPrice(product['price'])),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 12),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Địa chỉ giao hàng',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      _deliveryAddress = value;
                    },
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE8521A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: placing
                          ? null
                          : () async {
                              setSheetState(() {
                                placing = true;
                              });
                              await _placeOrder();
                              if (mounted) {
                                setSheetState(() {
                                  placing = false;
                                });
                              }
                            },
                      child: placing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Color(0xFFE8521A),
                                ),
                              ),
                            )
                          : const Text('Xác nhận đặt hàng'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = _cartCount();
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF7F2),
        elevation: 0,
        title: const Text(
          'QuickFood',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontFamily: 'PlayfairDisplay',
          ),
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined),
                onPressed: cartCount > 0 ? _openCheckoutSheet : null,
              ),
              if (cartCount > 0)
                Positioned(
                  right: 10,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8521A),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$cartCount',
                      style: const TextStyle(
                        color: Color(0xFFFFFFFF),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFE8521A)),
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.78,
              ),
              itemCount: _products.length,
              itemBuilder: (context, index) {
                final product = _products[index];
                final stock = product['stock'] as int? ?? 0;
                final disabled = stock <= 0;
                final cartItem = _findCartItem(product);
                final quantity = cartItem?['quantity'] as int? ?? 0;

                return Opacity(
                  key: ValueKey(product['id'] ?? index),
                  opacity: disabled ? 0.6 : 1,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFFFF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE7E0D8)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAF7F2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.fastfood,
                              color: Color(0xFFE8521A),
                              size: 40,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          product['name'] ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _formatPrice(product['price']),
                          style: const TextStyle(
                            color: Color(0xFFE8521A),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (disabled)
                          SizedBox(
                            width: double.infinity,
                            height: 36,
                            child: OutlinedButton(
                              onPressed: null,
                              child: const Text('Hết hàng'),
                            ),
                          )
                        else if (quantity > 0)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline),
                                onPressed: () => _removeFromCart(product),
                              ),
                              Text(
                                '$quantity',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline),
                                onPressed: () => _addToCart(product),
                              ),
                            ],
                          )
                        else
                          SizedBox(
                            width: double.infinity,
                            height: 36,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE8521A),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              onPressed: () => _addToCart(product),
                              child: const Text('+ Thêm'),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: cartCount > 0
          ? FloatingActionButton.extended(
              backgroundColor: const Color(0xFFE8521A),
              onPressed: _openCheckoutSheet,
              label: Text('Đặt hàng ($cartCount món)'),
              icon: const Icon(Icons.shopping_cart_checkout),
            )
          : null,
    );
  }
}
