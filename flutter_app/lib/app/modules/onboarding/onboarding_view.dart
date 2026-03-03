import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';
import 'onboarding_controller.dart';

class OnboardingView extends GetView<OnboardingController> {
  const OnboardingView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      body: Stack(
        children: [
          PageView(
            controller: controller.pageController,
            onPageChanged: controller.onPageChanged,
            children: [
              _buildSlide(
                title: 'Discover Festivals',
                description:
                    "Explore India's rich cultural tapestry. Learn about traditions, rituals, and stories behind every celebration.",
                icon: '🪔',
              ),
              _buildSlide(
                title: 'Earn Karma & Trophies',
                description:
                    'Participate in quizzes, daily trivia, and mark festivals as celebrated to rank up and unlock exclusive avatars.',
                icon: '🏆',
              ),
              _buildSlide(
                title: 'Share Beautiful Greetings',
                description:
                    'Create and share stunning, personalized festival wishes with your friends and family.',
                icon: '✨',
              ),
              _buildFinalSlide(),
            ],
          ),
          Positioned(
            bottom: AppSpacing.xxl,
            left: AppSpacing.xl,
            right: AppSpacing.xl,
            child: Obx(() {
              if (controller.currentPage.value == 3) {
                return const SizedBox.shrink(); // Hide controls on last slide
              }
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: controller.skip,
                    child: Text(
                      'Skip',
                      style: AppTextStyles.labelLarge.copyWith(
                        color: Colors.white54,
                      ),
                    ),
                  ),
                  Row(
                    children: List.generate(
                      4,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: controller.currentPage.value == index ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: controller.currentPage.value == index
                              ? AppColors.primary
                              : Colors.white24,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: controller.nextPage,
                    icon: const Icon(
                      Icons.arrow_forward_rounded,
                      color: AppColors.primary,
                    ),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                      padding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildSlide({
    required String title,
    required String description,
    required String icon,
  }) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(icon, style: const TextStyle(fontSize: 100))
              .animate()
              .scale(duration: 600.ms, curve: Curves.easeOutBack)
              .shake(delay: 600.ms),
          const SizedBox(height: AppSpacing.xxl),
          Text(
            title,
            style: AppTextStyles.displayMedium.copyWith(
              color: Colors.white,
              height: 1.2,
            ),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 300.ms).slideY(begin: 0.2),
          const SizedBox(height: AppSpacing.lg),
          Text(
            description,
            style: AppTextStyles.bodyLarge.copyWith(
              color: Colors.white70,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 500.ms).slideY(begin: 0.2),
        ],
      ),
    );
  }

  Widget _buildFinalSlide() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            '🌸',
            style: TextStyle(fontSize: 80),
            textAlign: TextAlign.center,
          ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),
          const SizedBox(height: AppSpacing.xl),
          Text(
            'Ready to Begin?',
            style: AppTextStyles.displayMedium.copyWith(
              color: AppColors.accent,
            ),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 300.ms),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Start your cultural journey today.',
            style: AppTextStyles.bodyLarge.copyWith(color: Colors.white70),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 500.ms),
          const SizedBox(height: AppSpacing.xxl * 2),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 8,
              shadowColor: AppColors.primary.withValues(alpha: 0.5),
            ),
            onPressed: controller.completeOnboarding,
            child: Text(
              'START EXPLORING',
              style: AppTextStyles.labelLarge.copyWith(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ).animate().fade(delay: 800.ms).scale(begin: const Offset(0.9, 0.9)),
        ],
      ),
    );
  }
}
