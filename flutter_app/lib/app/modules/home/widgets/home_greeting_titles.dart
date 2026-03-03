import 'package:flutter/material.dart';
// Removed unused services.dart import
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../home/home_controller.dart';
import '../../profile/profile_controller.dart';

class HomeGreetingTitles extends StatelessWidget {
  final HomeController controller;

  const HomeGreetingTitles({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final String rankText = Get.isRegistered<ProfileController>()
          ? Get.find<ProfileController>().rankTitle
          : 'Explorer';

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
                controller.timeGreeting,
                style: AppTextStyles.displayMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              )
              .animate()
              .fade(duration: 800.ms, delay: 200.ms)
              .slideX(begin: -0.05),
          Text(
                rankText,
                style: AppTextStyles.displayLarge.copyWith(height: 1.1),
              )
              .animate()
              .fade(duration: 800.ms, delay: 400.ms)
              .slideX(begin: -0.05),
          const SizedBox(height: 12),
          // Daily Blessing Card
          if (controller.dailyBlessingGreeting.value != null) ...[
            Container(
                  margin: const EdgeInsets.only(top: 8),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGlass,
                    borderRadius: AppRadius.cardRadius,
                    border: Border.all(color: Colors.white.withAlpha(20)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.wb_sunny_rounded,
                            color: Colors.amber,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Daily Blessing',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '"${controller.dailyBlessingQuote.value}"',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontStyle: FontStyle.italic,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        controller.dailyBlessingGreeting.value!,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                )
                .animate()
                .fade(duration: 800.ms, delay: 600.ms)
                .slideY(begin: 0.1),
          ] else ...[
            Text(
              'ready_to_celebrate'.tr,
              style: AppTextStyles.bodyLarge.copyWith(
                color: AppColors.textSecondary,
              ),
            ).animate().fade(duration: 800.ms, delay: 600.ms),
          ],
        ],
      );
    });
  }
}
