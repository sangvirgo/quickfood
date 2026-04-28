import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/network/dio_client.dart';

class CustomerOrdersScreen extends StatefulWidget {
  const CustomerOrdersScreen({super.key});

  @override
  State<CustomerOrdersScreen> createState() => _CustomerOrdersScreenState();
}

class _CustomerOrdersScreenState extends State<CustomerOrdersScreen> {
  final List<Map<String, dynamic>> _orders = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _loading = true;
    });

    try {
      final response = await DioClient.instance.get('/api/core/orders');
      final data = response.data;
      if (data is List) {
        _orders
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

  String _formatPrice(dynamic value) {
    final price = (value is num) ? value : 0;
    return '${NumberFormat('#,###', 'vi_VN').format(price)} đ';
  }

  Color _statusColor(String status) {
    if (status == 'READY') {
      return const Color(0xFF3B82F6);
    }
    if (status == 'DELIVERED') {
      return const Color(0xFF10B981);
    }
    return const Color(0xFFF59E0B);
  }

  void _openOrderDetail(Map<String, dynamic> order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFFFFFFFF),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _OrderDetailSheet(order: order),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF7F2),
        elevation: 0,
        title: const Text('Đơn hàng của tôi'),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFE8521A)),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final order = _orders[index];
                final status = (order['status'] ?? 'PENDING').toString();
                final createdAt = order['createdAt']?.toString();
                String createdLabel = '';
                if (createdAt != null && createdAt.isNotEmpty) {
                  final parsed = DateTime.tryParse(createdAt);
                  if (parsed != null) {
                    createdLabel = DateFormat(
                      'dd/MM/yyyy HH:mm',
                      'vi_VN',
                    ).format(parsed);
                  }
                }
                return InkWell(
                  key: ValueKey(order['id'] ?? index),
                  onTap: () => _openOrderDetail(order),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFFFF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE7E0D8)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Đơn #${order['id'] ?? ''}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: _statusColor(
                                  status,
                                ).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: _statusColor(status),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tổng tiền: ${_formatPrice(order['totalPrice'])}',
                          style: const TextStyle(
                            color: Color(0xFFE8521A),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (createdLabel.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            createdLabel,
                            style: const TextStyle(
                              color: Color(0xFF78716C),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemCount: _orders.length,
            ),
    );
  }
}

class _OrderDetailSheet extends StatefulWidget {
  const _OrderDetailSheet({required this.order});

  final Map<String, dynamic> order;

  @override
  State<_OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<_OrderDetailSheet> {
  Timer? _timer;
  Map<String, dynamic>? _tracking;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (_status == 'READY') {
      _fetchTracking();
      _timer = Timer.periodic(const Duration(seconds: 10), (_) {
        _fetchTracking();
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _status => (widget.order['status'] ?? 'PENDING').toString();

  String _formatPrice(dynamic value) {
    final price = (value is num) ? value : 0;
    return '${NumberFormat('#,###', 'vi_VN').format(price)} đ';
  }

  Future<void> _fetchTracking() async {
    setState(() {
      _loading = true;
    });

    try {
      final id = widget.order['id'];
      final response = await DioClient.instance.get(
        '/api/core/orders/$id/tracking',
      );
      final data = response.data;
      if (data is Map) {
        _tracking = Map<String, dynamic>.from(data);
      }
    } catch (_) {
      // Silent fail in sheet.
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _showMapDialog(String url) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Mở Google Maps'),
        content: SelectableText(url),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = (widget.order['items'] as List?) ?? [];
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Chi tiết đơn hàng',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...items.asMap().entries.map((entry) {
              final map = entry.value as Map;
              final product = map['product'] as Map?;
              final name = product?['name'] ?? '';
              final quantity = map['quantity'] ?? 0;
              final price = product?['price'] ?? 0;
              return Padding(
                key: ValueKey('${widget.order['id']}_${entry.key}'),
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '$name x$quantity',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(_formatPrice(price)),
                  ],
                ),
              );
            }),
            const SizedBox(height: 12),
            Text(
              'Tổng cộng: ${_formatPrice(widget.order['totalPrice'])}',
              style: const TextStyle(
                color: Color(0xFFE8521A),
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_status == 'READY') ...[
              const SizedBox(height: 16),
              const Text(
                'Theo dõi đơn hàng',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (_loading)
                const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFFE8521A),
                    ),
                  ),
                )
              else if (_tracking != null) ...[
                Text('Shipper: ${_tracking?['shipperName'] ?? ''}'),
                const SizedBox(height: 4),
                Text(
                  'Vị trí: ${_tracking?['lat'] ?? ''}, ${_tracking?['lng'] ?? ''}',
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () {
                    final lat = _tracking?['lat'] ?? '';
                    final lng = _tracking?['lng'] ?? '';
                    final url = 'https://maps.google.com/?q=$lat,$lng';
                    _showMapDialog(url);
                  },
                  child: const Text(
                    'Mở Google Maps',
                    style: TextStyle(
                      color: Color(0xFFE8521A),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ] else
                const Text('Chưa có thông tin shipper'),
            ],
          ],
        ),
      ),
    );
  }
}
