import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

/// Mark Celebrated Button — prominent CTA with magenta neon glow.
/// The glow intensity adapts to Light vs Dark mode to stay visible without
/// blowing out the light UI.
class MarkCelebratedButton extends StatelessWidget {
  const MarkCelebratedButton({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
          onTap: () {
            HapticFeedback.heavyImpact();
            Get.snackbar(
              '🎉 Celebrated!',
              '+20 Karma earned for celebrating this festival.',
              backgroundColor: AppColors.secondaryAdaptive(context).withValues(alpha: 0.9),
              colorText: Colors.white,
              snackPosition: SnackPosition.TOP,
              margin: const EdgeInsets.all(16),
              borderRadius: 14,
            );
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.secondaryAdaptive(context),
                  AppColors.secondaryAdaptive(context).withValues(alpha: 0.75),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: AppColors.secondaryAdaptive(context).withValues(
                    alpha: isDark ? 0.55 : 0.25,
                  ),
                  blurRadius: isDark ? 30 : 16,
                  offset: const Offset(0, 6),
                ),
                BoxShadow(
                  color: AppColors.secondaryAdaptive(context).withValues(
                    alpha: isDark ? 0.25 : 0.1,
                  ),
                  blurRadius: 60,
                  spreadRadius: -5,
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  LucideIcons.partyPopper,
                  color: Colors.white,
                  size: 22,
                ),
                const SizedBox(width: 10),
                Text(
                  'MARK AS CELEBRATED',
                  style: AppTextStyles.labelLarge(context).copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
        )
        .animate()
        .fade(delay: 400.ms)
        .slideY(begin: 0.2)
        .scale(begin: const Offset(0.97, 0.97), curve: Curves.easeOut);
  }
}
