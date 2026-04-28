import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/network/dio_client.dart';

class StaffProductsScreen extends StatefulWidget {
  const StaffProductsScreen({super.key});

  @override
  State<StaffProductsScreen> createState() => _StaffProductsScreenState();
}

class _StaffProductsScreenState extends State<StaffProductsScreen> {
  final List<Map<String, dynamic>> _products = [];
  bool _loading = false;
  String _query = '';

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

  void _showSuccess(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }

  String _formatPrice(dynamic value) {
    final price = (value is num) ? value : 0;
    return '${NumberFormat('#,###', 'vi_VN').format(price)} đ';
  }

  OutlineInputBorder _inputBorder(Color color) {
    return OutlineInputBorder(
      borderSide: BorderSide(color: color),
      borderRadius: BorderRadius.circular(12),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: _inputBorder(const Color(0xFFE7E0D8)),
      focusedBorder: _inputBorder(const Color(0xFFE8521A)),
    );
  }

  List<Map<String, dynamic>> _filteredProducts() {
    if (_query.trim().isEmpty) {
      return _products;
    }
    final keyword = _query.toLowerCase();
    return _products
        .where(
          (product) => (product['name'] ?? '')
              .toString()
              .toLowerCase()
              .contains(keyword),
        )
        .toList();
  }

  Future<void> _deleteProduct(Map<String, dynamic> product) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa sản phẩm'),
        content: const Text('Bạn chắc chắn muốn xóa sản phẩm này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirm != true) {
      return;
    }

    final backup = List<Map<String, dynamic>>.from(_products);
    setState(() {
      _products.remove(product);
    });

    try {
      final id = product['id'];
      await DioClient.instance.delete('/api/core/products/$id');
      _showSuccess('Đã xóa sản phẩm');
    } on DioException catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _products
          ..clear()
          ..addAll(backup);
      });
      _showError(DioClient.handleError(e));
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _products
          ..clear()
          ..addAll(backup);
      });
      _showError('Có lỗi xảy ra');
    }
  }

  void _openProductForm({Map<String, dynamic>? product}) {
    // Khai báo controllers ở đây, NGOÀI builder
    final nameController = TextEditingController(
      text: product?['name']?.toString() ?? '',
    );
    final priceController = TextEditingController(
      text: product?['price']?.toString() ?? '',
    );
    final stockController = TextEditingController(
      text: product?['stock']?.toString() ?? '',
    );
    final imageController = TextEditingController(
      text: product?['imageUrl']?.toString() ?? '',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFFFFFFFF),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        bool saving = false;

        Future<void> submit(
          void Function(void Function()) setSheetState,
        ) async {
          final name = nameController.text.trim();
          final price = double.tryParse(priceController.text.trim());
          final stock = int.tryParse(stockController.text.trim());

          if (name.isEmpty || price == null || stock == null) {
            _showError('Vui lòng nhập đủ thông tin hợp lệ');
            return;
          }

          final payload = {
            'name': name,
            'price': price,
            'stock': stock,
            'imageUrl': imageController.text.trim().isEmpty
                ? null
                : imageController.text.trim(),
          };

          setSheetState(() {
            saving = true;
          });

          try {
            if (product == null) {
              await DioClient.instance.post(
                '/api/core/products',
                data: payload,
              );
              _showSuccess('Thêm sản phẩm thành công');
            } else {
              final id = product['id'];
              await DioClient.instance.put(
                '/api/core/products/$id',
                data: payload,
              );
              _showSuccess('Cập nhật sản phẩm thành công');
            }
            if (!mounted) {
              return;
            }
            Navigator.of(context).pop();
            _loadProducts();
          } on DioException catch (e) {
            _showError(DioClient.handleError(e));
          } catch (_) {
            _showError('Có lỗi xảy ra');
          } finally {
            setSheetState(() {
              saving = false;
            });
          }
        }

        return StatefulBuilder(
          builder: (context, setSheetState) {
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
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      product == null ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: nameController,
                      decoration: _inputDecoration('Tên sản phẩm'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: priceController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('Giá'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: stockController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('Tồn kho'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: imageController,
                      decoration: _inputDecoration('Ảnh (URL)'),
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
                        onPressed: saving ? null : () => submit(setSheetState),
                        child: saving
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
                            : const Text('Lưu'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final products = _filteredProducts();
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAF7F2),
        elevation: 0,
        title: const Text('Quản lý sản phẩm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => _openProductForm(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm theo tên sản phẩm',
                prefixIcon: const Icon(Icons.search),
                border: _inputBorder(const Color(0xFFE7E0D8)),
                focusedBorder: _inputBorder(const Color(0xFFE8521A)),
                filled: true,
                fillColor: const Color(0xFFFFFFFF),
              ),
              onChanged: (value) {
                setState(() {
                  _query = value;
                });
              },
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
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      final stock = product['stock'] ?? 0;
                      final imageUrl = product['imageUrl']?.toString() ?? '';
                      return Container(
                        key: ValueKey(product['id'] ?? index),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFFFF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE7E0D8)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                width: 72,
                                height: 72,
                                color: const Color(0xFFFAF7F2),
                                child: imageUrl.isEmpty
                                    ? const Icon(
                                        Icons.image_not_supported,
                                        color: Color(0xFF78716C),
                                      )
                                    : Image.network(
                                        imageUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return const Icon(
                                                Icons.broken_image_outlined,
                                                color: Color(0xFF78716C),
                                              );
                                            },
                                      ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product['name'] ?? '',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    _formatPrice(product['price']),
                                    style: const TextStyle(
                                      color: Color(0xFFE8521A),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE7E0D8),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      'Tồn kho: $stock',
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined),
                                  onPressed: () =>
                                      _openProductForm(product: product),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () => _deleteProduct(product),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemCount: products.length,
                  ),
          ),
        ],
      ),
    );
  }
}
