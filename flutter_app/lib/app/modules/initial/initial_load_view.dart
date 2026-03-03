import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../routes/app_pages.dart';
import '../../widgets/neo_scaffold.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/painters/particle_explosion_painter.dart';
import 'package:get_storage/get_storage.dart' as get_storage;

class InitialLoadController extends GetxController {}

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

    // Start Sequence
    _startSequence();
  }

  Future<void> _startSequence() async {
    // 1. Wait for standard build
    await Future.delayed(const Duration(milliseconds: 500));

    // 2. Trigger Big Bang (Particle Explosion)
    await _bangController.forward();

    // 3. Check first launch and navigate with Fade Transition
    final storage = get_storage.GetStorage();
    final isFirstLaunch = storage.read<bool>('is_first_launch') ?? true;

    if (isFirstLaunch) {
      Get.offAllNamed(Routes.ONBOARDING);
    } else {
      Get.offAllNamed(Routes.DASHBOARD);
    }
  }

  @override
  void dispose() {
    _bangController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      hideNoise: true, // Clean look for splash
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
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
                      style: AppTextStyles.festiveLarge.copyWith(
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
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 4,
                  ),
                ).animate().fade(delay: 400.ms).slideY(begin: 0.5),
              ],
            ).animate(
              // Exit animation: Scale huge and fade out when bang happens
              target: _bangController.value > 0.1 ? 1 : 0,
            ),
            // Note: flutter_animate's 'target' isn't simple boolean switch for complex sequence without controller binding
            // Simplified: Just let it stay, the page transition will handle the exit feel.
          ],
        ),
      ),
    );
  }
}
