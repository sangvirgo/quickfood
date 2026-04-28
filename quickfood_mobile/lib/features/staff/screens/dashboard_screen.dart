import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/auth_storage.dart';

class StaffDashboardScreen extends StatefulWidget {
  const StaffDashboardScreen({super.key});

  @override
  State<StaffDashboardScreen> createState() => _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends State<StaffDashboardScreen> {
  final List<Map<String, dynamic>> _pendingOrders = [];
  Timer? _timer;
  bool _loading = false;
  String _staffName = '';

  @override
  void initState() {
    super.initState();
    _loadStaffName();
    _loadPendingOrders();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadPendingOrders();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadStaffName() async {
    final user = await AuthStorage.getUser();
    if (!mounted) {
      return;
    }
    setState(() {
      _staffName = user?['name']?.toString() ?? '';
    });
  }

  Future<void> _loadPendingOrders() async {
    setState(() {
      _loading = true;
    });

    try {
      final response = await DioClient.instance.get('/api/core/orders/pending');
      final data = response.data;
      if (data is List) {
        _pendingOrders
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

  Future<void> _approveOrder(Map<String, dynamic> order) async {
    final backup = List<Map<String, dynamic>>.from(_pendingOrders);
    setState(() {
      _pendingOrders.remove(order);
    });

    try {
      final id = order['id'];
      await DioClient.instance.put('/api/core/orders/$id/ready');
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đơn hàng đã được duyệt'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    } on DioException catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _pendingOrders
          ..clear()
          ..addAll(backup);
      });
      _showError(DioClient.handleError(e));
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _pendingOrders
          ..clear()
          ..addAll(backup);
      });
      _showError('Có lỗi xảy ra');
    }
  }

  int _totalOrders() => _pendingOrders.length;

  int _totalItems() {
    int count = 0;
    for (final order in _pendingOrders) {
      final items = order['items'] as List? ?? [];
      count += items.length;
    }
    return count;
  }

  int _totalQuantity() {
    int count = 0;
    for (final order in _pendingOrders) {
      final items = order['items'] as List? ?? [];
      for (final item in items) {
        if (item is Map) {
          count += item['quantity'] as int? ?? 0;
        }
      }
    }
    return count;
  }

  int _totalAmount() {
    int total = 0;
    for (final order in _pendingOrders) {
      final value = order['totalPrice'];
      if (value is num) {
        total += value.toInt();
      }
    }
    return total;
  }

  Widget _statCard(String title, String value) {
    return Expanded(
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
            Text(
              title,
              style: const TextStyle(color: Color(0xFF78716C), fontSize: 12),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: const [
          Icon(Icons.check_circle_outline, size: 72, color: Color(0xFF10B981)),
          SizedBox(height: 12),
          Text(
            'Tất cả đã xử lý! 🎉',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFFE8521A)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0x33FFFFFF),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.restaurant,
                      color: Color(0xFFFFFFFF),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'QuickFood',
                    style: TextStyle(
                      color: Color(0xFFFFFFFF),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _staffName.isEmpty ? 'Nhân viên' : _staffName,
                    style: const TextStyle(color: Color(0xB3FFFFFF)),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.pending_actions),
              title: const Text('Đơn chờ xử lý'),
              onTap: () => Navigator.of(context).pop(),
            ),
            ListTile(
              leading: const Icon(Icons.inventory_2_outlined),
              title: const Text('Sản phẩm'),
              onTap: () {
                Navigator.of(context).pop();
                if (!context.mounted) {
                  return;
                }
                context.push('/staff/products');
              },
            ),
            const Spacer(),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Đăng xuất'),
              onTap: () async {
                await AuthStorage.clearAll();
                if (!context.mounted) {
                  return;
                }
                context.go('/login');
              },
            ),
          ],
        ),
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF7F2),
        elevation: 0,
        title: const Text('Đơn chờ xử lý'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Row(
              children: [
                _statCard('Đơn', _totalOrders().toString()),
                const SizedBox(width: 10),
                _statCard('Món', _totalItems().toString()),
                const SizedBox(width: 10),
                _statCard('SL', _totalQuantity().toString()),
                const SizedBox(width: 10),
                _statCard('Doanh thu', _formatPrice(_totalAmount())),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFFE8521A),
                      ),
                    ),
                  )
                : _pendingOrders.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemBuilder: (context, index) {
                      final order = _pendingOrders[index];
                      final items = order['items'] as List? ?? [];
                      return Container(
                        key: ValueKey(order['id'] ?? index),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFFFF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE7E0D8)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Đơn #${order['id'] ?? ''}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ...items.asMap().entries.map((entry) {
                              final map = entry.value as Map;
                              final name = map['productName']?.toString() ?? '';
                              final quantity = map['quantity'] ?? 0;
                              return Padding(
                                key: ValueKey('${order['id']}_${entry.key}'),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 2,
                                ),
                                child: Text('- $name x$quantity'),
                              );
                            }),
                            const SizedBox(height: 8),
                            Text(
                              'Giao tới: ${order['deliveryAddress'] ?? 'Bởi Shipper'}',
                              style: const TextStyle(color: Color(0xFF78716C)),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFE8521A),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () => _approveOrder(order),
                                child: const Text('✓ Duyệt'),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemCount: _pendingOrders.length,
                  ),
          ),
        ],
      ),
    );
  }
}
