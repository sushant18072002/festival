import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/glass_container.dart';

class ProfileStatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final int delay;

  const ProfileStatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
    this.delay = 0,
  });

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      color: AppColors.surfaceGlass,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.headlineMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: AppTextStyles.labelSmall.copyWith(color: Colors.white60),
          ),
        ],
      ),
    ).animate(delay: delay.ms).fade().slideY(begin: 0.1);
  }
}
