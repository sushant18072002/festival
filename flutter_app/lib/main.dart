import 'dart:ui';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'app/routes/app_pages.dart';
import 'app/theme/app_theme.dart';
import 'app/translations/app_translations.dart';
import 'global.dart';

// Pass --dart-define=ENV=dev when running in development to load .env.dev
const _env = String.fromEnvironment('ENV', defaultValue: 'prod');

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load the correct .env file for the current environment
  if (_env == 'dev') {
    await dotenv.load(fileName: '.env.dev');
    debugPrint('[Env] Loaded .env.dev');
  } else {
    // Attempt to load .env.prod if it exists, otherwise fall back to --dart-define
    try {
      await dotenv.load(fileName: '.env.prod');
      debugPrint('[Env] Loaded .env.prod');
    } catch (_) {
      debugPrint('[Env] Production mode — no .env.prod file found, using platform env');
    }
  }

  await Global.init();

  // ── Error handling ───────────────────────────────────────────────────────
  ErrorWidget.builder = (FlutterErrorDetails details) {
    if (kDebugMode) return ErrorWidget(details.exception);
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              LucideIcons.circleAlert,
              color: Colors.white54,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Oops, something went wrong.',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.9),
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    Sentry.captureException(error, stackTrace: stack);
    return true;
  };

  // ── Pre-initialize translations BEFORE Sentry's appRunner ────────────────
  // This ensures .tr works even if Sentry delays runApp by a few ms.
  final preStorage = GetStorage();
  String initLang = preStorage.read('lang') ?? 'en';
  if (initLang.length > 2) initLang = initLang.substring(0, 2);
  Get.addTranslations(AppTranslations().keys);
  Get.locale = Locale(initLang);
  debugPrint('[AppTranslations] Pre-initialized for locale: $initLang');

  // ── Sentry wraps runApp (disabled in dev unless DSN is set) ──────────────
  await SentryFlutter.init((options) {
    options.dsn = const String.fromEnvironment('SENTRY_DSN', defaultValue: '');
    options.tracesSampleRate = kDebugMode ? 0.0 : 1.0; // no perf data in dev
    options.attachStacktrace = true;
  }, appRunner: () => runApp(const MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // GetStorage is already initialized in Global.init().
    // Lang + theme are read here so GetMaterialApp starts with the persisted state.
    // Translations were also pre-initialized in main() before Sentry, so .tr
    // is always safe regardless of Sentry's app-runner timing.
    final storage = GetStorage();
    String savedLang = storage.read('lang') ?? 'en';
    if (savedLang.length > 2) {
      savedLang = savedLang.substring(0, 2);
      storage.write('lang', savedLang);
    }

    ThemeMode initialThemeMode = ThemeMode.system;
    if (storage.hasData('is_dark_mode')) {
      final bool isDark = storage.read('is_dark_mode');
      initialThemeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    }

    return GetMaterialApp(
      title: 'Utsav',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: initialThemeMode,
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
      debugShowCheckedModeBanner: kDebugMode, // banner only in debug builds
      translations: AppTranslations(), // canonical GetX registry
      locale: Locale(savedLang),
      fallbackLocale: const Locale('en'),
    );
  }
}
