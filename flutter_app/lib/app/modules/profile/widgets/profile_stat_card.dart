import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class ProfileStatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final int delay;
  final Color? accentColor;

  const ProfileStatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
    this.delay = 0,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeAccent = accentColor ?? AppColors.primaryAdaptive(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(24),
        border: AppColors.adaptiveBorder(context, opacityFactor: 1.2),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icon with subtle background tint
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: themeAccent.withValues(alpha: isDark ? 0.15 : 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: themeAccent,
              size: 18,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTextStyles.titleLarge(context).copyWith(
              color: AppColors.textAdaptive(context),
              fontWeight: FontWeight.w900,
              height: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title.toUpperCase(),
            style: AppTextStyles.labelSmall(context).copyWith(
              color: AppColors.textAdaptiveSecondary(context),
              letterSpacing: 1.0,
              fontWeight: FontWeight.bold,
              fontSize: 9,
            ),
          ),
        ],
      ),
    ).animate(delay: delay.ms).fade().slideY(begin: 0.1, curve: Curves.easeOutBack);
  }
}
