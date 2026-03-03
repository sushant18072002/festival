import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class MarkCelebratedButton extends StatelessWidget {
  const MarkCelebratedButton({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        HapticFeedback.heavyImpact();
        Get.snackbar(
          '🎉 Celebrated!',
          '+20 Karma earned for celebrating this festival.',
          backgroundColor: AppColors.primary.withValues(alpha: 0.9),
          colorText: Colors.black,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary,
              AppColors.primary.withValues(alpha: 0.8),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.black87),
            const SizedBox(width: 8),
            Text(
              'MARK AS CELEBRATED',
              style: AppTextStyles.labelLarge.copyWith(
                color: Colors.black87,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    ).animate().fade().slideY(begin: 0.2);
  }
}
