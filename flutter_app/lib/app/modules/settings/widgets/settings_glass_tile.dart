import 'package:flutter/material.dart';
import '../../../widgets/glass_container.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_spacing.dart';

class SettingsGlassTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final Widget child;

  const SettingsGlassTile({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: BorderRadius.circular(20),
      color: AppColors.surfaceGlass(context),
      opacity: 0.1,
      border: Border.all(color: AppColors.glassBorder(context)),
      child: Row(
        children: [
          // Icon Container
          Container(
            margin: const EdgeInsets.all(AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          // Content
          Expanded(child: child),
        ],
      ),
    );
  }
}
