import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/quote_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../quote_detail_view.dart';

class RelatedQuoteCard extends StatelessWidget {
  final QuoteModel quote;
  final int index;

  const RelatedQuoteCard({super.key, required this.quote, required this.index});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        // Navigation: using Get.off avoids a massive backstack of quote surfing
        Get.off(() => QuoteDetailView(quote: quote), transition: Transition.fadeIn);
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
                : AppColors.primaryAdaptive(context).withValues(alpha: 0.12),
          ),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black.withValues(alpha: 0.3)
                  : AppColors.primaryAdaptive(context).withValues(alpha: 0.06),
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
                  LucideIcons.quote,
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
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
            Expanded(
              child: Text(
                '"${quote.text}"',
                style: AppTextStyles.bodyMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                  fontWeight: FontWeight.w500,
                  height: 1.5,
                ),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 14),
            Container(
              width: 24,
              height: 2,
              decoration: BoxDecoration(
                color: AppColors.primaryAdaptive(context).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '— ${quote.author.isNotEmpty ? quote.author : 'Unknown'}',
              style: AppTextStyles.labelSmall(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ).animate().fade(delay: (200 + (index * 100)).ms).slideX(begin: 0.15),
    );
  }
}
