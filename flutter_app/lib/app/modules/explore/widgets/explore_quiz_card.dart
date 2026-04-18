import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../data/models/quiz_model.dart';
import '../../../routes/app_pages.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';

class ExploreQuizCard extends StatelessWidget {
  final QuizModel quiz;
  final int index;

  const ExploreQuizCard({super.key, required this.quiz, required this.index});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Determine emoji fallback
    String emoji = '✨';
    if (quiz.results.isNotEmpty && quiz.results.first.emoji.isNotEmpty) {
      emoji = quiz.results.first.emoji;
    } else if (quiz.questions.isNotEmpty && quiz.questions.first.emoji.isNotEmpty) {
      emoji = quiz.questions.first.emoji;
    }

    return GestureDetector(
      onTap: () => Get.toNamed(Routes.quiz, arguments: quiz),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        child: GlassContainer(
          borderRadius: BorderRadius.circular(20),
          padding: const EdgeInsets.all(AppSpacing.md),
          color: AppColors.surfaceGlass(context),
          opacity: isDark ? 0.3 : 0.8,
          border: Border.all(color: AppColors.glassBorder(context)),
          child: Row(
            children: [
              // Emoji Circle
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                ),
                child: Center(
                  child: Text(
                    emoji,
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // Text Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quiz.title,
                      style: AppTextStyles.titleMedium(context).copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${quiz.karmaReward} Karma Reward',
                      style: AppTextStyles.labelSmall(context).copyWith(
                        color: AppColors.accentAdaptive(context),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                LucideIcons.chevronRight,
                color: AppColors.primaryAdaptive(context),
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
