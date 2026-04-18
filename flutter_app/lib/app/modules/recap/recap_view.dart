import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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
                AppColors.primaryAdaptive(context),
                AppColors.accentAdaptive(context),
                AppColors.secondaryAdaptive(context),
                AppColors.accentAdaptive(context),
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
              _buildIntroSlide(context),
              _buildStatsSlide(context),
              _buildStreakSlide(context),
              _buildOutroSlide(context),
            ],
          ),

          // Close Button
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 20,
            child: IconButton(
              icon: Icon(LucideIcons.x, color: Colors.white.withValues(alpha: 0.7)),
              onPressed: () => Get.back(),
            ),
          ),

          // Indicators
          Positioned(
            top: MediaQuery.of(context).padding.top + 20,
            left: 20,
            right: 60,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
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
                          boxShadow: isActive
                              ? [BoxShadow(color: Colors.white.withValues(alpha: 0.5), blurRadius: 4)]
                              : [],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIntroSlide(BuildContext context) {
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
            style: AppTextStyles.displayLarge(context).copyWith(
              height: 1.1,
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
            ),
          ).animate().fade(delay: 300.ms).slideX(),
          const SizedBox(height: 24),
          Text(
            'Let\'s look back at the festivals you celebrated and the karma you earned.',
            style: AppTextStyles.bodyLarge(context).copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ).animate().fade(delay: 600.ms).slideX(),
        ],
      ),
    );
  }

  Widget _buildStatsSlide(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'You earned',
            style: AppTextStyles.headlineMedium(context).copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ).animate().fade().slideY(),
          Text(
            '${controller.totalKarma}',
            style: AppTextStyles.displayLarge(context).copyWith(
              fontSize: 80,
              color: AppColors.accentAdaptive(context),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
            ),
          ).animate().fade(delay: 200.ms).scale(),
          Text(
            'Karma Points ✨',
            style: AppTextStyles.headlineLarge(context).copyWith(
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 8)],
            ),
          ).animate().fade(delay: 400.ms).slideY(),
          const SizedBox(height: 40),
          Text(
            '...by celebrating ${controller.totalCheckins} festivals this year!',
            style: AppTextStyles.bodyLarge(context).copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ).animate().fade(delay: 600.ms),
        ],
      ),
    );
  }

  Widget _buildStreakSlide(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            LucideIcons.flame,
            size: 80,
            color: AppColors.accentAdaptive(context),
          ).animate().scale(curve: Curves.easeOutBack, duration: 800.ms),
          const SizedBox(height: 24),
          Text(
            'Your longest streak was',
            style: AppTextStyles.headlineMedium(context).copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ).animate().fade(delay: 200.ms).slideX(),
          Text(
            '${controller.topStreak} days',
            style: AppTextStyles.displayLarge(context).copyWith(
              color: AppColors.accentAdaptive(context),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
            ),
          ).animate().fade(delay: 400.ms).scale(),
          const SizedBox(height: 24),
          Text(
            'You kept the festive spirit burning bright! Consistency is key.',
            style: AppTextStyles.bodyLarge(context).copyWith(
              color: Colors.white.withValues(alpha: 0.8),
              shadows: [Shadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 8)],
            ),
          ).animate().fade(delay: 600.ms),
        ],
      ),
    );
  }

  Widget _buildOutroSlide(BuildContext context) {
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
            style: AppTextStyles.displayMedium(context),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 300.ms).slideY(),
          const SizedBox(height: 20),
          Text(
            'More festivals, more memories, more joy waiting for you.',
            style: AppTextStyles.bodyLarge(context).copyWith(color: Colors.white.withValues(alpha: 0.7)),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 600.ms),
          const SizedBox(height: 60),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryAdaptive(context),
              foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            onPressed: () => Get.back(),
            child: Text('Let\'s Go', style: AppTextStyles.labelLarge(context)),
          ).animate().fade(delay: 900.ms).scale(),
        ],
      ),
    );
  }
}
