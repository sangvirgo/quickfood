import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'core/router/app_router.dart';

void main() {
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
