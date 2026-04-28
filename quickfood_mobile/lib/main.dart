import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart'; // thêm dòng này
import 'package:intl/intl.dart';

import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi_VN', null);
  Intl.defaultLocale = 'vi_VN';
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFE8521A)),
        useMaterial3: true,
      ),
      routerConfig: appRouter,
    );
  }
}
