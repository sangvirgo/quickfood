# QuickFood Flutter — Project Context

## Stack
- Flutter 3.x, Dart
- Dio 5.4 (HTTP), GoRouter 13.x (routing), SharedPreferences (storage), intl (format)
- Android Emulator → backend tại 10.0.2.2:8080

## Backend API Base
- Emulator: http://10.0.2.2:8080
- iOS Sim: http://localhost:8080

## Design Tokens (Material 3)
- primary: #E8521A
- background: #FAF7F2
- surface: #FFFFFF
- secondary: #1C1917
- muted: #78716C
- border: #E7E0D8
- Font heading style: bold, letterSpacing 0.5
- Border radius chuẩn: 12px

## Roles & Routing
- CUSTOMER → /home, /orders
- STAFF    → /staff/dashboard, /staff/products
- SHIPPER  → /shipper/dashboard

## Auth
- JWT Bearer token
- Lưu bằng SharedPreferences: key 'qf_token', 'qf_user' (JSON)
- Interceptor tự gắn header Authorization

## Code Convention
- Mỗi feature = 1 folder: screens/, widgets/, models/, services/
- Dùng StatefulWidget hoặc setState — KHÔNG dùng Provider/Riverpod/Bloc
- Tất cả text UI: tiếng Việt
- Format tiền: NumberFormat('#,###', 'vi_VN').format(price) + ' đ'
- Format ngày: DateFormat('dd/MM/yyyy HH:mm', 'vi_VN')
- Xử lý lỗi: try/catch, hiện SnackBar màu đỏ khi lỗi
- Loading: CircularProgressIndicator màu primary
- KHÔNG dùng thư viện ngoài ngoài pubspec.yaml đã có