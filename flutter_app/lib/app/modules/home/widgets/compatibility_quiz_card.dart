import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import 'quiz_view.dart';
import '../home_controller.dart';

class CompatibilityQuizCard extends StatelessWidget {
  final bool isSecondary;
  const CompatibilityQuizCard({super.key, this.isSecondary = false});

  @override
  Widget build(BuildContext context) {
    final adaptiveSecondary = AppColors.secondaryAdaptive(context);
    
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
      ),
      child: GestureDetector(
        onTap: () {
          Get.find<HomeController>().recordActivity('quiz');
          HapticFeedback.lightImpact();
          Get.to(
            () => const QuizView(),
            transition: Transition.downToUp,
            duration: const Duration(milliseconds: 400),
          );
        },
        child: Opacity(
          opacity: isSecondary ? 0.8 : 1.0,
          child: GlassContainer(
            borderRadius: BorderRadius.circular(24),
            padding: EdgeInsets.all(isSecondary ? AppSpacing.md : AppSpacing.lg),
            color: adaptiveSecondary,
            opacity: 0.08,
            child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          LucideIcons.brainCircuit,
                          color: adaptiveSecondary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'personality_quiz'.tr,
                          style: AppTextStyles.labelMedium(context).copyWith(
                            color: adaptiveSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'quiz_card_title'.tr,
                      style: AppTextStyles.titleMedium(context),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'quiz_card_subtitle'.tr,
                      style: AppTextStyles.bodySmall(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: adaptiveSecondary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      LucideIcons.chevronRight,
                      color: Colors.white,
                      size: 16,
                    ),
                  )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .slideX(begin: -0.2, end: 0.2, duration: 800.ms),
            ],
          ),
        ),
      ),
    ),
  );
}
}
