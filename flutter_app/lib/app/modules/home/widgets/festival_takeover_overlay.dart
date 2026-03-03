import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import '../../profile/profile_controller.dart';
import '../home_controller.dart';
import '../../../routes/app_pages.dart';

class FestivalTakeoverOverlay extends StatelessWidget {
  final EventModel event;
  const FestivalTakeoverOverlay({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      HapticFeedback.heavyImpact();
    });

    return Material(
      color: Colors.transparent,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Blurred translucent black backdrop
          GestureDetector(
            onTap: () => Get.find<HomeController>().dismissTakeover(),
            child: Container(color: Colors.black87),
          ),

          // Particle burst background (simple colour orbs)
          ...List.generate(12, (i) => _buildOrb(i)),

          // Central card
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child:
                  GlassContainer(
                    borderRadius: BorderRadius.circular(28),
                    color: AppColors.surfaceGlass,
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.15),
                      width: 1.5,
                    ),
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Festival Icon / Emoji
                        const Text('🎊', style: TextStyle(fontSize: 72))
                            .animate()
                            .scale(delay: 100.ms, curve: Curves.easeOutBack)
                            .shake(delay: 600.ms, hz: 3),

                        const SizedBox(height: AppSpacing.lg),

                        Text(
                          'Today is',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: Colors.white54,
                            letterSpacing: 2,
                          ),
                        ).animate().fade(delay: 300.ms),

                        const SizedBox(height: 6),

                        Text(
                          event.title,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.headlineLarge.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            height: 1.2,
                          ),
                        ).animate().fade(delay: 400.ms).slideY(begin: 0.2),

                        const SizedBox(height: AppSpacing.md),

                        // 2× Karma Badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [AppColors.primary, AppColors.accent],
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.bolt_rounded,
                                color: Colors.white,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '2× KARMA TODAY',
                                style: AppTextStyles.labelMedium.copyWith(
                                  color: Colors.white,
                                  letterSpacing: 1.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ).animate().fade(delay: 600.ms).scale(delay: 600.ms),

                        const SizedBox(height: AppSpacing.xl),

                        // CTA Buttons
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white30),
                                  foregroundColor: Colors.white70,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                onPressed: () {
                                  HapticFeedback.lightImpact();
                                  Get.find<HomeController>().dismissTakeover();
                                },
                                child: const Text('Later'),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              flex: 2,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                onPressed: () {
                                  HapticFeedback.mediumImpact();
                                  // Award 2× Karma
                                  if (Get.isRegistered<ProfileController>()) {
                                    Get.find<ProfileController>().addKarma(20);
                                  }
                                  Get.find<HomeController>().dismissTakeover();
                                  Get.toNamed(
                                    Routes.EVENT_DETAILS,
                                    arguments: event,
                                  );
                                },
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.celebration, size: 16),
                                    SizedBox(width: 6),
                                    Text('Celebrate Now!'),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ).animate().fade(delay: 800.ms).slideY(begin: 0.2),
                      ],
                    ),
                  ).animate().scale(
                    begin: const Offset(0.85, 0.85),
                    duration: 500.ms,
                    curve: Curves.easeOutBack,
                  ),
            ),
          ),

          // Close button top-right
          Positioned(
            top: 50,
            right: 20,
            child: GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                Get.find<HomeController>().dismissTakeover();
              },
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white12,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, color: Colors.white70, size: 20),
              ),
            ).animate().fade(delay: 200.ms),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildOrb(int index) {
    final colors = [
      AppColors.primary.withValues(alpha: 0.25),
      AppColors.accent.withValues(alpha: 0.2),
      Colors.orangeAccent.withValues(alpha: 0.2),
      Colors.pinkAccent.withValues(alpha: 0.15),
    ];
    final size = 80.0 + (index % 4) * 40;
    final positions = [
      const Alignment(-1.2, -1.3),
      const Alignment(1.3, -1.0),
      const Alignment(-0.8, 1.5),
      const Alignment(1.4, 1.2),
      const Alignment(0.0, -1.8),
      const Alignment(-1.6, 0.3),
      const Alignment(1.0, 0.5),
      const Alignment(0.4, 1.8),
      const Alignment(-0.4, -0.9),
      const Alignment(0.9, -0.7),
      const Alignment(-1.0, 0.9),
      const Alignment(0.2, 0.0),
    ];
    return Align(
      alignment: positions[index % positions.length],
      child:
          Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors[index % colors.length],
                ),
              )
              .animate(delay: (index * 60).ms)
              .fade(duration: 600.ms)
              .scale(begin: const Offset(0.4, 0.4), curve: Curves.easeOutCirc),
    );
  }
}
