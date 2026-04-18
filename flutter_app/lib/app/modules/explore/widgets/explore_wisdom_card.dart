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
  final VoidCallback? onTap;

  const ExploreWisdomCard({
    super.key,
    required this.text,
    required this.author,
    required this.language,
    this.isMantra = false,
    this.isFeatured = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = AppColors.surfaceGlass(context);

    final borderColor = AppColors.glassBorder(context);


    final fontColor = AppColors.textAdaptive(context);
    final authorColor = AppColors.textAdaptiveSecondary(context);

    final textStyle = AppTextStyles.displaySmall(context).copyWith(
      fontStyle: FontStyle.italic,
      color: fontColor,
      height: 1.4,
      fontSize: isFeatured ? 26 : 20,
    );

    if (isFeatured) {
      return GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          if (onTap != null) onTap!();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.xl,
          ),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(32),
            border: AppColors.adaptiveBorder(context),
            boxShadow: AppColors.glassShadow(context),
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
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.05),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    isMantra ? LucideIcons.sparkles : LucideIcons.quote,
                    size: 40,
                    color: AppColors.primaryAdaptive(context),
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
                              style: AppTextStyles.labelLarge(context).copyWith(
                                color: AppColors.textAdaptive(context),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              isMantra
                                  ? 'Ancient Mantra • ${language.toUpperCase()}'
                                  : 'Cultural Wisdom • ${language.toUpperCase()}',
                              style: AppTextStyles.labelSmall(context).copyWith(
                                color: AppColors.primaryAdaptive(context),
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
        if (onTap != null) onTap!();
      },
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
          border: AppColors.adaptiveBorder(context),
          boxShadow: AppColors.glassShadow(context),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              isMantra ? LucideIcons.sparkles : LucideIcons.quote,
              size: 24,
              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
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
                      style: AppTextStyles.labelSmall(context).copyWith(
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
                    color: AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.5),
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
