import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/mantra_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../mantra_details_view.dart';

class RelatedMantraCard extends StatelessWidget {
  final MantraModel mantra;
  final int index;

  const RelatedMantraCard({super.key, required this.mantra, required this.index});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        Get.off(() => MantraDetailsView(mantra: mantra), transition: Transition.fadeIn);
      },
      child: Container(
        // No fixed width — PageView controls sizing via viewportFraction
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : const Color(0xFFD4AF37).withValues(alpha: 0.15),
          ),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black.withValues(alpha: 0.3)
                  : const Color(0xFFD4AF37).withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  LucideIcons.flower,
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.8),
                  size: 22,
                ),
                const Spacer(),
                Icon(
                  LucideIcons.chevronRight,
                  color: AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.3),
                  size: 14,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              mantra.text,
              style: AppTextStyles.titleMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                fontWeight: FontWeight.w600,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (mantra.transliteration.isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                width: 24,
                height: 2,
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: Text(
                  mantra.transliteration,
                  style: AppTextStyles.labelSmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ],
        ),
      ).animate().fade(delay: (200 + (index * 100)).ms).slideX(begin: 0.15),
    );
  }
}
