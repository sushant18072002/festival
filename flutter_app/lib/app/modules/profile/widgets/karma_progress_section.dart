import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../routes/app_pages.dart';
import '../profile_controller.dart';

class KarmaProgressSection extends StatelessWidget {
  final ProfileController controller;

  const KarmaProgressSection({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        // Premium Progression Card - High Density Redesign
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceGlass(context),
            borderRadius: BorderRadius.circular(28),
            border: AppColors.adaptiveBorder(context, opacityFactor: 1.2),
            boxShadow: AppColors.glassShadow(context),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        controller.rankTitle.toUpperCase(),
                        style: AppTextStyles.labelSmall(context).copyWith(
                          color: AppColors.accentAdaptive(context),
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          fontSize: 10,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${controller.karmaPoints.value} Karma',
                        style: AppTextStyles.titleLarge(context).copyWith(
                          color: AppColors.textAdaptive(context),
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.accentAdaptive(context).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      LucideIcons.flame,
                      color: AppColors.accentAdaptive(context),
                      size: 24,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // High-fidelity Slim Progress Bar
              Stack(
                children: [
                  Container(
                    height: 6,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  FractionallySizedBox(
                    widthFactor: controller.percentageToNextRank.clamp(0.05, 1.0),
                    child: Container(
                      height: 6,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primaryAdaptive(context),
                            AppColors.accentAdaptive(context),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(3),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryAdaptive(context).withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Text(
                    'Level Progress',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
                      fontWeight: FontWeight.w600,
                      fontSize: 10,
                    ),
                  ),
                  Text(
                    '${controller.karmaToNextRank} to next rank',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.accentAdaptive(context),
                      fontWeight: FontWeight.w700,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ).animate(delay: 200.ms).fade().slideY(begin: 0.1),

        const SizedBox(height: 16),

        // Compact Journey Pill
        GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            Get.toNamed(Routes.recap);
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark 
                    ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                    : [Colors.white, const Color(0xFFF1F5F9)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: AppColors.adaptiveBorder(context),
              boxShadow: AppColors.glassShadow(context),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  LucideIcons.sparkles,
                  color: AppColors.primaryAdaptive(context),
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  'VIEW YOUR ${DateTime.now().year} JOURNEY',
                  style: AppTextStyles.labelSmall(context).copyWith(
                    color: AppColors.textAdaptive(context),
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
        )
        .animate(delay: 400.ms)
        .fade()
        .slideY(begin: 0.2)
        .shimmer(delay: 1000.ms, duration: 2000.ms, color: AppColors.primaryAdaptive(context).withValues(alpha: 0.2)),
      ],
    );
  }
}
