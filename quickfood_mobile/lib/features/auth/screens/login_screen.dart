import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/auth_storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  final _registerNameController = TextEditingController();
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();
  final _registerPhoneController = TextEditingController();

  bool _loginObscure = true;
  bool _registerObscure = true;

  bool _loginLoading = false;
  bool _registerLoading = false;

  String _registerRole = 'CUSTOMER';
  DateTime? _registerDob;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _registerNameController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    _registerPhoneController.dispose();
    super.dispose();
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

  String _getRoleRoute(String role) {
    if (role == 'STAFF') {
      return '/staff/dashboard';
    }
    if (role == 'SHIPPER') {
      return '/shipper/dashboard';
    }
    return '/home';
  }

  Future<void> _handleLogin() async {
    if (_loginLoading) {
      return;
    }
    setState(() {
      _loginLoading = true;
    });

    try {
      final response = await DioClient.instance.post(
        '/api/core/auth/login',
        data: {
          'email': _loginEmailController.text.trim(),
          'password': _loginPasswordController.text,
        },
      );

      final data = response.data;
      if (data is Map) {
        final token = data['token'];
        // Thay vì data['user'], build user map từ flat response
        if (token is String) {
          final user = <String, dynamic>{
            'id': data['id'],
            'email': data['email'],
            'role': data['role'],
          };
          await AuthStorage.saveToken(token);
          await AuthStorage.saveUser(user);
          final role = user['role'] is String ? user['role'] as String : '';
          if (!mounted) return;
          context.go(_getRoleRoute(role));
          return;
        }
      }
      if (!mounted) {
        return;
      }
      _showError('Có lỗi xảy ra');
    } on DioException catch (e) {
      if (!mounted) {
        return;
      }
      _showError(DioClient.handleError(e));
    } catch (_) {
      if (!mounted) {
        return;
      }
      _showError('Có lỗi xảy ra');
    } finally {
      if (mounted) {
        setState(() {
          _loginLoading = false;
        });
      }
    }
  }

  Future<void> _handleRegister() async {
    if (_registerLoading) {
      return;
    }
    setState(() {
      _registerLoading = true;
    });

    try {
      final payload = <String, dynamic>{
        'name': _registerNameController.text.trim(),
        'email': _registerEmailController.text.trim(),
        'password': _registerPasswordController.text,
        'role': _registerRole,
      };

      if (_registerRole == 'SHIPPER') {
        payload['phone'] = _registerPhoneController.text.trim();
        if (_registerDob != null) {
          payload['dateOfBirth'] = DateFormat(
            'yyyy-MM-dd',
          ).format(_registerDob!);
        }
      }

      await DioClient.instance.post('/api/core/auth/register', data: payload);

      if (!mounted) {
        return;
      }
      _tabController.animateTo(0);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký thành công!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    } on DioException catch (e) {
      if (!mounted) {
        return;
      }
      _showError(DioClient.handleError(e));
    } catch (_) {
      if (!mounted) {
        return;
      }
      _showError('Có lỗi xảy ra');
    } finally {
      if (mounted) {
        setState(() {
          _registerLoading = false;
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

  Future<void> _pickDob() async {
    final initialDate = _registerDob ?? DateTime(2000, 1, 1);
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1950, 1, 1),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _registerDob = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8521A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'QuickFood',
                      style: TextStyle(
                        color: Color(0xFFFFFFFF),
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Giao nhanh, món ngon mỗi ngày',
                      style: TextStyle(color: Color(0xB3FFFFFF), fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
            TabBar(
              controller: _tabController,
              labelColor: const Color(0xFFE8521A),
              unselectedLabelColor: const Color(0xFF78716C),
              indicatorColor: const Color(0xFFE8521A),
              tabs: const [
                Tab(text: 'Đăng nhập'),
                Tab(text: 'Đăng ký'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _loginEmailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: _inputDecoration('Email'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _loginPasswordController,
                          obscureText: _loginObscure,
                          enableSuggestions: false,      // thêm dòng này
                          autocorrect: false,            // thêm dòng này
                          autofillHints: const [AutofillHints.password],  // thêm dòng này
                          decoration: _inputDecoration('Mật khẩu').copyWith(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _loginObscure
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                              ),
                              onPressed: () {
                                setState(() {
                                  _loginObscure = !_loginObscure;
                                });
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
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
                            onPressed: _loginLoading ? null : _handleLogin,
                            child: _loginLoading
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
                                : const Text('Đăng nhập'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _registerNameController,
                          decoration: _inputDecoration('Họ tên'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _registerEmailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: _inputDecoration('Email'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _registerPasswordController,
                          obscureText: _registerObscure,
                          decoration: _inputDecoration('Mật khẩu').copyWith(
                            suffixIcon: IconButton(
                              icon: Icon(
                                _registerObscure
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                              ),
                              onPressed: () {
                                setState(() {
                                  _registerObscure = !_registerObscure;
                                });
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          initialValue: _registerRole,
                          decoration: _inputDecoration('Vai trò'),
                          items: const [
                            DropdownMenuItem(
                              value: 'CUSTOMER',
                              child: Text('CUSTOMER'),
                            ),
                            DropdownMenuItem(
                              value: 'STAFF',
                              child: Text('STAFF'),
                            ),
                            DropdownMenuItem(
                              value: 'SHIPPER',
                              child: Text('SHIPPER'),
                            ),
                          ],
                          onChanged: (value) {
                            if (value == null) {
                              return;
                            }
                            setState(() {
                              _registerRole = value;
                            });
                          },
                        ),
                        if (_registerRole == 'SHIPPER') ...[
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _registerPhoneController,
                            keyboardType: TextInputType.phone,
                            decoration: _inputDecoration('Số điện thoại'),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            readOnly: true,
                            decoration: _inputDecoration('Ngày sinh').copyWith(
                              suffixIcon: const Icon(Icons.calendar_today),
                            ),
                            onTap: _pickDob,
                            controller: TextEditingController(
                              text: _registerDob == null
                                  ? ''
                                  : DateFormat(
                                      'dd/MM/yyyy',
                                    ).format(_registerDob!),
                            ),
                          ),
                        ],
                        const SizedBox(height: 20),
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
                            onPressed: _registerLoading
                                ? null
                                : _handleRegister,
                            child: _registerLoading
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
                                : const Text('Đăng ký'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
