import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'recap_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

class RecapView extends GetView<RecapController> {
  const RecapView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      body: Stack(
        children: [
          // Background Gradient
          Positioned.fill(
            child: Obx(() {
              final colors = [
                AppColors.primary,
                AppColors.accent,
                Colors.purpleAccent,
                Colors.orangeAccent,
              ];
              // Change background color based on slide index
              return AnimatedContainer(
                duration: const Duration(milliseconds: 800),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      colors[controller.currentSlideIndex.value % colors.length]
                          .withValues(alpha: 0.8),
                      Colors.black87,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              );
            }),
          ),

          // Particle overlay (simulate stars/confetti)
          Positioned.fill(
            child: Opacity(
              opacity: 0.2,
              child: Image.asset(
                'assets/images/noise.png',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ),

          // PageView
          PageView(
            physics: const BouncingScrollPhysics(),
            onPageChanged: (index) {
              HapticFeedback.lightImpact();
              controller.currentSlideIndex.value = index;
            },
            children: [
              _buildIntroSlide(),
              _buildStatsSlide(),
              _buildStreakSlide(),
              _buildOutroSlide(),
            ],
          ),

          // Close Button
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 20,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white70),
              onPressed: () => Get.back(),
            ),
          ),

          // Indicators
          Positioned(
            top: MediaQuery.of(context).padding.top + 20,
            left: 20,
            right: 60,
            child: Obx(
              () => Row(
                children: List.generate(4, (index) {
                  final isActive = controller.currentSlideIndex.value == index;
                  return Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      height: 4,
                      decoration: BoxDecoration(
                        color: isActive
                            ? Colors.white
                            : Colors.white.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntroSlide() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🎉', style: TextStyle(fontSize: 80))
              .animate()
              .scale(curve: Curves.easeOutBack, duration: 800.ms)
              .shake(delay: 800.ms),
          const SizedBox(height: 24),
          Text(
            'Your ${DateTime.now().year}\nUtsav Journey.',
            style: AppTextStyles.displayLarge.copyWith(height: 1.1),
          ).animate().fade(delay: 300.ms).slideX(),
          const SizedBox(height: 24),
          Text(
            'Let\'s look back at the festivals you celebrated and the karma you earned.',
            style: AppTextStyles.bodyLarge.copyWith(color: Colors.white70),
          ).animate().fade(delay: 600.ms).slideX(),
        ],
      ),
    );
  }

  Widget _buildStatsSlide() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'You earned',
            style: AppTextStyles.headlineMedium.copyWith(color: Colors.white70),
          ).animate().fade().slideY(),
          Text(
            '${controller.totalKarma}',
            style: AppTextStyles.displayLarge.copyWith(
              fontSize: 80,
              color: AppColors.accent,
            ),
          ).animate().fade(delay: 200.ms).scale(),
          Text(
            'Karma Points ✨',
            style: AppTextStyles.headlineLarge,
          ).animate().fade(delay: 400.ms).slideY(),
          const SizedBox(height: 40),
          Text(
            '...by celebrating ${controller.totalCheckins} festivals this year!',
            style: AppTextStyles.bodyLarge.copyWith(color: Colors.white70),
          ).animate().fade(delay: 600.ms),
        ],
      ),
    );
  }

  Widget _buildStreakSlide() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.local_fire_department,
            size: 80,
            color: Colors.orangeAccent,
          ).animate().scale(curve: Curves.easeOutBack, duration: 800.ms),
          const SizedBox(height: 24),
          Text(
            'Your longest streak was',
            style: AppTextStyles.headlineMedium.copyWith(color: Colors.white70),
          ).animate().fade(delay: 200.ms).slideX(),
          Text(
            '${controller.topStreak} days',
            style: AppTextStyles.displayLarge.copyWith(
              color: Colors.orangeAccent,
            ),
          ).animate().fade(delay: 400.ms).scale(),
          const SizedBox(height: 24),
          Text(
            'You kept the festive spirit burning bright! Consistency is key.',
            style: AppTextStyles.bodyLarge.copyWith(color: Colors.white70),
          ).animate().fade(delay: 600.ms),
        ],
      ),
    );
  }

  Widget _buildOutroSlide() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text('🎊', style: TextStyle(fontSize: 80))
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .scale(
                duration: const Duration(seconds: 1),
                begin: const Offset(0.9, 0.9),
              ),
          const SizedBox(height: 40),
          Text(
            'Ready for ${DateTime.now().year + 1}?',
            style: AppTextStyles.displayMedium,
            textAlign: TextAlign.center,
          ).animate().fade(delay: 300.ms).slideY(),
          const SizedBox(height: 20),
          Text(
            'More festivals, more memories, more joy waiting for you.',
            style: AppTextStyles.bodyLarge.copyWith(color: Colors.white70),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 600.ms),
          const SizedBox(height: 60),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            onPressed: () => Get.back(),
            child: Text('Let\'s Go', style: AppTextStyles.labelLarge),
          ).animate().fade(delay: 900.ms).scale(),
        ],
      ),
    );
  }
}
