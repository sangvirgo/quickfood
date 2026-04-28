import 'package:go_router/go_router.dart';

import '../../features/auth/screens/login_screen.dart';
import '../../features/customer/screens/home_screen.dart';
import '../../features/customer/screens/orders_screen.dart';
import '../../features/shipper/screens/dashboard_screen.dart';
import '../../features/staff/screens/dashboard_screen.dart';
import '../../features/staff/screens/products_screen.dart';
import '../storage/auth_storage.dart';

Future<String?> _guardRole(String requiredRole) async {
  final loggedIn = await AuthStorage.isLoggedIn();
  if (!loggedIn) {
    return '/login';
  }
  final role = await AuthStorage.getUserRole();
  if (role != requiredRole) {
    return '/login';
  }
  return null;
}

Future<String?> _rootRedirect() async {
  final loggedIn = await AuthStorage.isLoggedIn();
  if (!loggedIn) {
    return '/login';
  }
  final role = await AuthStorage.getUserRole();
  if (role == 'CUSTOMER') {
    return '/home';
  }
  if (role == 'STAFF') {
    return '/staff/dashboard';
  }
  if (role == 'SHIPPER') {
    return '/shipper/dashboard';
  }
  return '/login';
}

final appRouter = GoRouter(
  routes: [
    GoRoute(path: '/', redirect: (context, state) async => _rootRedirect()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/home',
      redirect: (context, state) async => _guardRole('CUSTOMER'),
      builder: (context, state) => const CustomerHomeScreen(),
    ),
    GoRoute(
      path: '/orders',
      redirect: (context, state) async => _guardRole('CUSTOMER'),
      builder: (context, state) => const CustomerOrdersScreen(),
    ),
    GoRoute(
      path: '/staff/dashboard',
      redirect: (context, state) async => _guardRole('STAFF'),
      builder: (context, state) => const StaffDashboardScreen(),
    ),
    GoRoute(
      path: '/staff/products',
      redirect: (context, state) async => _guardRole('STAFF'),
      builder: (context, state) => const StaffProductsScreen(),
    ),
    GoRoute(
      path: '/shipper/dashboard',
      redirect: (context, state) async => _guardRole('SHIPPER'),
      builder: (context, state) => const ShipperDashboardScreen(),
    ),
  ],
);
