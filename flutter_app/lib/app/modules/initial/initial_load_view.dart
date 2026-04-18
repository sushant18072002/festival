import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../data/services/asset_service.dart';
import '../../widgets/smart_lottie.dart';
import '../../routes/app_pages.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/painters/particle_explosion_painter.dart';
import 'package:get_storage/get_storage.dart' as get_storage;

import 'dart:async';
import '../../data/providers/data_repository.dart';

class InitialLoadController extends GetxController {
  final _trivia = [
    "Did you know? Diwali is celebrated by over a billion people globally.",
    "Fun Fact: Holi's colors are historically made from neem and turmeric.",
    "Insight: Navratri celebrates nine nights of the divine feminine.",
    "Did you know? The exact date of festivals changes based on the lunar calendar.",
    "Fun Fact: Kumbh Mela is visible from space!",
    "Gathering spiritual wisdom...",
    "Aligning with the stars...",
  ];
  
  final RxString currentTrivia = "Loading festival magic...".obs;
  Timer? _timer;
  int _triviaIndex = 0;

  @override
  void onInit() {
    super.onInit();
    _startTriviaRotator();
  }

  void _startTriviaRotator() {
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _triviaIndex = (_triviaIndex + 1) % _trivia.length;
      currentTrivia.value = _trivia[_triviaIndex];
    });
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }
}

class InitialLoadView extends StatefulWidget {
  const InitialLoadView({super.key});

  @override
  State<InitialLoadView> createState() => _InitialLoadViewState();
}

class _InitialLoadViewState extends State<InitialLoadView>
    with TickerProviderStateMixin {
  late AnimationController _bangController;

  @override
  void initState() {
    super.initState();
    _bangController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    Get.put(InitialLoadController());
    // Start Sequence
    _startSequence();
  }

  Future<void> _startSequence() async {
    // 1. Wait for standard build & initial delay
    await Future.delayed(const Duration(milliseconds: 1500));

    // 2. Wait until DataRepository finishes background sync
    final repo = Get.find<DataRepository>();
    if (!repo.isReady.value) {
      debugPrint('[InitialLoadView] Waiting for data sync...');
      final completer = Completer<void>();
      Worker? worker;
      worker = ever(repo.isReady, (ready) {
        if (ready && !completer.isCompleted) {
          completer.complete();
          worker?.dispose();
        }
      });
      await completer.future;
    }
    
    // Safety buffer
    await Future.delayed(const Duration(milliseconds: 500));

    // 3. Trigger Big Bang (Particle Explosion)
    await _bangController.forward();

    // 4. Check first launch and navigate with Fade Transition
    final storage = get_storage.GetStorage();
    final isFirstLaunch = storage.read<bool>('is_first_launch') ?? true;

    if (isFirstLaunch) {
      Get.offAllNamed(Routes.onboarding);
    } else {
      Get.offAllNamed(Routes.dashboard);
    }
  }

  @override
  void dispose() {
    _bangController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<InitialLoadController>();
    return Scaffold(
      backgroundColor: const Color(0xFF0A0214), // Deep OLED Purple-Black
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // ─────────────────────────────────────────────────────────────────
            // Ambient Radial Glow
            // ─────────────────────────────────────────────────────────────────
            Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.2,
                  colors: [
                    AppColors.primary.withValues(alpha: 0.25),
                    const Color(0xFF0A0214),
                  ],
                ),
              ),
            ),
            // ─────────────────────────────────────────────────────────────────
            // 1. The Big Bang (Particles)
            // ─────────────────────────────────────────────────────────────────
            AnimatedBuilder(
              animation: _bangController,
              builder: (context, child) {
                return CustomPaint(
                  painter: ParticleExplosionPainter(
                    progress: _bangController.value,
                    color: AppColors.primary, // Cyan Explosion
                  ),
                  size: Size.infinite,
                );
              },
            ),

            // ─────────────────────────────────────────────────────────────────
            // 2. Logo & Text (Centeral Scaling)
            // ─────────────────────────────────────────────────────────────────
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Glowing Orb Logo
                Container(
                      padding: const EdgeInsets.all(30),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.5),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.5),
                            blurRadius: 50,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        size: 60,
                        color: Colors.white,
                      ),
                    )
                    .animate()
                    .scale(
                      duration: 800.ms,
                      curve: Curves.easeOutBack,
                    ) // Scale Up
                    .then()
                    .animate(onPlay: (c) => c.repeat()) // Pulse while waiting
                    .shimmer(duration: 1500.ms, color: AppColors.secondary),

                const SizedBox(height: 48),

                // Title
                Text(
                      'UTSAV',
                      style: AppTextStyles.festiveLarge(context).copyWith(
                        letterSpacing: 8,
                        color: Colors.white,
                        fontSize: 48,
                      ),
                    )
                    .animate()
                    .fade(duration: 800.ms)
                    .scale(begin: const Offset(0.8, 0.8)),

                const SizedBox(height: 16),

                // Subtitle
                Text(
                  'The Spirit of Celebration',
                  style: AppTextStyles.labelMedium(context).copyWith(
                    color: Colors.white70,
                    letterSpacing: 4,
                  ),
                ).animate().fade(delay: 400.ms).slideY(begin: 0.5),
              ],
            ).animate(
              // Exit animation: Scale huge and fade out when bang happens
              target: _bangController.value > 0.1 ? 1 : 0,
            ),
            
            // ─────────────────────────────────────────────────────────────────
            // 3. Rotating Trivia (Bottom Loading Indicator)
            // ─────────────────────────────────────────────────────────────────
            Positioned(
              bottom: 60,
              left: 24,
              right: 24,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                   SizedBox(
                    width: 48,
                    height: 48,
                    child: SmartLottie(
                      url: AssetService.to.getLottie(GlobalAsset.loading),
                      fallbackAsset: 'assets/lottie/loading_mandala.json',
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Obx(
                    () => AnimatedSwitcher(
                      duration: const Duration(milliseconds: 600),
                      switchInCurve: Curves.easeOut,
                      switchOutCurve: Curves.easeIn,
                      child: Text(
                        controller.currentTrivia.value,
                        key: ValueKey<String>(controller.currentTrivia.value),
                        textAlign: TextAlign.center,
                        style: AppTextStyles.labelMedium(context).copyWith(
                          color: Colors.white70,
                          fontStyle: FontStyle.italic,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
              ).animate().fade(delay: 1000.ms),
            ),
          ],
        ),
      ),
    );
  }
}
