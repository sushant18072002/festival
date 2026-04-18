import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';
import '../theme/app_text_styles.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

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
    final iconColor = AppColors.textAdaptiveSecondary(context);
    final titleColor = AppColors.textAdaptive(context);
    final bodyColor = AppColors.textAdaptiveSecondary(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.cloudOff, color: iconColor, size: 80),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Connection Lost',
              style: AppTextStyles.headlineMedium(context).copyWith(color: titleColor),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              style: AppTextStyles.bodyMedium(context).copyWith(color: bodyColor),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.xl),
              ElevatedButton.icon(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryAdaptive(context),
                  foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.sm,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                icon: const Icon(LucideIcons.refreshCw),
                label: const Text('Try Again'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
