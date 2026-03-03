import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../routes/app_pages.dart';
import '../profile_controller.dart';

class KarmaProgressSection extends StatelessWidget {
  final ProfileController controller;

  const KarmaProgressSection({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Rank Title
        Text(
          controller.rankTitle,
          style: AppTextStyles.headlineMedium.copyWith(
            color: AppColors.accent,
            fontWeight: FontWeight.bold,
          ),
        ).animate(delay: 100.ms).fade().slideY(begin: 0.1),
        const SizedBox(height: 8),

        // Karma Points
        Text(
          '${controller.karmaPoints.value} Karma Points',
          style: AppTextStyles.labelLarge.copyWith(color: Colors.white70),
        ).animate(delay: 200.ms).fade(),
        const SizedBox(height: 16),

        // Progress Bar Wrapper
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: controller.percentageToNextRank,
                  minHeight: 8,
                  backgroundColor: Colors.white12,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${controller.karmaToNextRank} to next rank',
                style: AppTextStyles.labelSmall.copyWith(color: Colors.white54),
              ),
            ],
          ),
        ).animate(delay: 300.ms).fade().scaleX(alignment: Alignment.centerLeft),

        AppSpacing.verticalXl,

        // Year End Recap Button
        GestureDetector(
              onTap: () {
                HapticFeedback.mediumImpact();
                Get.toNamed(Routes.RECAP);
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.auto_awesome,
                      color: Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'View Your 2025 Journey',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            )
            .animate(delay: 500.ms)
            .fade()
            .slideY(begin: 0.2)
            .shimmer(delay: 1000.ms, duration: 1500.ms),
      ],
    );
  }
}
