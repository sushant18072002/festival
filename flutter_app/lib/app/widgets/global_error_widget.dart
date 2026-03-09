import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';

class GlobalErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const GlobalErrorWidget({
    super.key,
    this.message = 'Oops, something went wrong.',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = isDark
        ? Colors.white54
        : const Color(0xFF3D1F5C).withValues(alpha: 0.5);
    final titleColor = isDark ? Colors.white : const Color(0xFF1A0B2E);
    final bodyColor = isDark
        ? Colors.white54
        : const Color(0xFF3D1F5C).withValues(alpha: 0.7);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_off_rounded, color: iconColor, size: 80),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Connection Lost',
              style: AppTextStyles.headlineMedium.copyWith(color: titleColor),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              style: AppTextStyles.bodyMedium.copyWith(color: bodyColor),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.xl),
              ElevatedButton.icon(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.sm,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try Again'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
