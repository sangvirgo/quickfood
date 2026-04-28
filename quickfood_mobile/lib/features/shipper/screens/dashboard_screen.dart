import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/auth_storage.dart';

class ShipperDashboardScreen extends StatefulWidget {
  const ShipperDashboardScreen({super.key});

  @override
  State<ShipperDashboardScreen> createState() => _ShipperDashboardScreenState();
}

class _ShipperDashboardScreenState extends State<ShipperDashboardScreen> {
  Map<String, dynamic>? _shipperProfile;
  List<Map<String, dynamic>> _availableShipments = [];
  String? _currentShipmentId;
  bool _isBusy = false;
  bool _isLoadingLocation = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadCurrentShipment();
    _loadProfile();
    _loadAvailableShipments();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (!_isBusy) {
        _loadAvailableShipments();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadCurrentShipment() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) {
      return;
    }
    setState(() {
      _currentShipmentId = prefs.getString('qf_current_shipment');
    });
  }

  Future<void> _loadProfile() async {
    try {
      final response = await DioClient.instance.get(
        '/api/delivery/shippers/me',
      );
      final data = response.data;
      if (data is Map) {
        final profile = Map<String, dynamic>.from(data);
        if (!mounted) {
          return;
        }
        setState(() {
          _shipperProfile = profile;
          _isBusy = (profile['busy'] ?? profile['isBusy'] ?? false) == true;
        });
      }
    } on DioException catch (e) {
      _showError(DioClient.handleError(e));
    } catch (_) {
      _showError('Có lỗi xảy ra');
    }
  }

  Future<void> _loadAvailableShipments() async {
    try {
      final response = await DioClient.instance.get(
        '/api/delivery/shipments/available',
      );
      final data = response.data;
      if (data is List) {
        if (!mounted) {
          return;
        }
        setState(() {
          _availableShipments = data
              .whereType<Map>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList();
        });
      }
    } on DioException catch (e) {
      _showError(DioClient.handleError(e));
    } catch (_) {
      _showError('Có lỗi xảy ra');
    }
  }

  Future<void> _acceptShipment(Map<String, dynamic> shipment) async {
    try {
      final id = shipment['id']?.toString() ?? '';
      if (id.isEmpty) {
        return;
      }
      await DioClient.instance.put('/api/delivery/shipments/$id/accept');
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('qf_current_shipment', id);
      if (!mounted) {
        return;
      }
      setState(() {
        _currentShipmentId = id;
        _isBusy = true;
      });
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      if (statusCode == 409 || statusCode == 500) {
        _showError('Đơn vừa được shipper khác nhận');
      } else {
        _showError(DioClient.handleError(e));
      }
    } catch (_) {
      _showError('Có lỗi xảy ra');
    }
  }

  Future<void> _updateLocation() async {
    if (_currentShipmentId == null || _isLoadingLocation) {
      return;
    }

    setState(() {
      _isLoadingLocation = true;
    });

    try {
      await DioClient.instance.put(
        '/api/delivery/shippers/me/location',
        data: {'lat': 10.762622, 'lng': 106.660172},
      );
      if (!mounted) {
        return;
      }
      final time = DateFormat('HH:mm').format(DateTime.now());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã cập nhật vị trí lúc $time'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    } on DioException catch (e) {
      _showError(DioClient.handleError(e));
    } catch (_) {
      _showError('Có lỗi xảy ra');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }

  Future<void> _completeShipment() async {
    final id = _currentShipmentId;
    if (id == null) {
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hoàn thành giao hàng'),
        content: const Text('Xác nhận đã giao đơn hàng này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );

    if (confirm != true) {
      return;
    }

    try {
      await DioClient.instance.put('/api/delivery/shipments/$id/complete');
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('qf_current_shipment');
      if (!mounted) {
        return;
      }
      setState(() {
        _currentShipmentId = null;
        _isBusy = false;
      });
      _loadProfile();
      _loadAvailableShipments();
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

  Widget _buildStatusBanner() {
    final count = _availableShipments.length;
    final isBusy = _isBusy;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isBusy ? const Color(0xFFFEF3C7) : const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE7E0D8)),
      ),
      child: Row(
        children: [
          Text(isBusy ? '📦' : '🛵', style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isBusy ? 'Đang giao hàng' : 'Sẵn sàng nhận đơn',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  isBusy ? 'Đơn đang xử lý' : '$count đơn chờ',
                  style: const TextStyle(color: const Color(0xFF78716C)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentDeliveryCard() {
    if (!_isBusy || _currentShipmentId == null) {
      return const SizedBox.shrink();
    }
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8521A), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Đơn đang giao #$_currentShipmentId',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE8521A),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _isLoadingLocation ? null : _updateLocation,
              icon: _isLoadingLocation
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          const Color(0xFFFFFFFF),
                        ),
                      ),
                    )
                  : const Text('📍'),
              label: const Text('Cập nhật vị trí'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _completeShipment,
              child: const Text('✓ Hoàn thành giao hàng'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableList() {
    if (_isBusy) {
      return const SizedBox.shrink();
    }

    if (_availableShipments.isEmpty) {
      return const Padding(
        padding: EdgeInsets.only(top: 24),
        child: Center(child: Text('Chưa có đơn nào. Chờ một chút ☕')),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.only(top: 16),
      itemBuilder: (context, index) {
        final shipment = _availableShipments[index];
        final id = shipment['id'] ?? '';
        final orderId = shipment['orderId'] ?? shipment['order']?['id'] ?? id;
        final address =
            shipment['deliveryAddress'] ??
            shipment['order']?['deliveryAddress'] ??
            '';
        return Container(
          key: ValueKey(id),
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
                'Đơn #$orderId',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                address.toString(),
                style: const TextStyle(color: const Color(0xFF78716C)),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 40,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE8521A),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => _acceptShipment(shipment),
                  child: const Text('Nhận đơn →'),
                ),
              ),
            ],
          ),
        );
      },
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemCount: _availableShipments.length,
    );
  }

  @override
  Widget build(BuildContext context) {
    final shipperName = _shipperProfile?['name']?.toString() ?? 'Shipper';
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF7F2),
        elevation: 0,
        title: const Text('QuickFood 🛵'),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 6),
              child: Text(
                shipperName,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthStorage.clearAll();
              if (!context.mounted) {
                return;
              }
              context.go('/login');
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildStatusBanner(),
          _buildCurrentDeliveryCard(),
          _buildAvailableList(),
        ],
      ),
    );
  }
}
