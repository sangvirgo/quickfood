import 'package:dio/dio.dart';

import '../storage/auth_storage.dart';

class DioClient {
  DioClient._internal() : _dio = Dio(_baseOptions) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await AuthStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          if (statusCode == 401) {
            await AuthStorage.clearAll();
            handler.reject(error.copyWith(message: 'Phiên đăng nhập hết hạn'));
            return;
          }
          handler.next(error);
        },
      ),
    );
  }

  static final DioClient _instance = DioClient._internal();

  final Dio _dio;

  static BaseOptions get _baseOptions => BaseOptions(
    baseUrl: 'http://10.0.2.2:8080',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
  );

  static Dio get instance => _instance._dio;

  static String handleError(DioException e) {
    final statusCode = e.response?.statusCode;
    if (statusCode == 401) {
      return 'Phiên đăng nhập hết hạn';
    }
    if (statusCode == 404) {
      return 'Không tìm thấy dữ liệu';
    }
    if (statusCode == 500) {
      return 'Lỗi server, thử lại sau';
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return 'Kết nối timeout, kiểm tra mạng';
    }
    return e.message ?? 'Có lỗi xảy ra';
  }
}
