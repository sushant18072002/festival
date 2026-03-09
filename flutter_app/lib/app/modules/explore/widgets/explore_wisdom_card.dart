import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class ExploreWisdomCard extends StatelessWidget {
  final String text;
  final String author;
  final String language;
  final bool isMantra;
  final bool isFeatured;

  const ExploreWisdomCard({
    super.key,
    required this.text,
    required this.author,
    required this.language,
    this.isMantra = false,
    this.isFeatured = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark
        ? const Color(0xFF1A2B2C).withValues(alpha: 0.4) // Deep teal glass
        : Colors.white;

    final borderColor = isDark
        ? AppColors.primary.withValues(alpha: 0.15)
        : AppColors.primary.withValues(alpha: 0.05);

    final shadow = isDark
        ? const BoxShadow(color: Colors.transparent)
        : BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          );

    final fontColor = isDark ? Colors.white : const Color(0xFF1A0B2E);
    final authorColor = isDark ? Colors.white70 : const Color(0xFF3D1F5C);

    final textStyle = AppTextStyles.displaySmall.copyWith(
      fontStyle: FontStyle.italic,
      color: fontColor,
      height: 1.4,
      fontSize: isFeatured ? 26 : 20,
    );

    if (isFeatured) {
      return GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.xl,
          ),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: borderColor),
            boxShadow: [shadow],
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                right: -20,
                top: -20,
                child: Icon(
                  isMantra ? LucideIcons.sparkles : LucideIcons.quote,
                  size: 140,
                  color: AppColors.primary.withValues(alpha: 0.05),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    isMantra ? LucideIcons.sparkles : LucideIcons.quote,
                    size: 40,
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(text, style: textStyle),
                  const SizedBox(height: AppSpacing.xl),
                  Row(
                    children: [
                      Container(
                        height: 44,
                        width: 44,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.primaryGradient,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          author.isNotEmpty ? author[0].toUpperCase() : 'U',
                          style: const TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              author.isNotEmpty ? author : 'Unknown',
                              style: AppTextStyles.labelLarge.copyWith(
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              isMantra
                                  ? 'Ancient Mantra • ${language.toUpperCase()}'
                                  : 'Cultural Wisdom • ${language.toUpperCase()}',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
      },
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor),
          boxShadow: [shadow],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              isMantra ? LucideIcons.sparkles : LucideIcons.quote,
              size: 24,
              color: AppColors.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              text,
              style: textStyle,
              maxLines: 5,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.lg),
            Container(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: borderColor)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      author.isNotEmpty
                          ? "${author.toUpperCase()} • ${language.toUpperCase()}"
                          : "UNKNOWN • ${language.toUpperCase()}",
                      style: AppTextStyles.labelSmall.copyWith(
                        color: authorColor,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    LucideIcons.arrowRight,
                    size: 14,
                    color: isDark ? Colors.white30 : Colors.black38,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
