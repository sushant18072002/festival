import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import 'quiz_view.dart';

class CompatibilityQuizCard extends StatelessWidget {
  const CompatibilityQuizCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          Get.to(
            () => const QuizView(),
            transition: Transition.downToUp,
            duration: const Duration(milliseconds: 400),
          );
        },
        child: GlassContainer(
          borderRadius: BorderRadius.circular(24),
          padding: const EdgeInsets.all(AppSpacing.lg),
          color: Colors.purpleAccent.withValues(alpha: 0.1),
          border: Border.all(color: Colors.purpleAccent.withValues(alpha: 0.3)),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.psychology_alt_rounded,
                          color: Colors.purpleAccent,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Personality Quiz',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: Colors.purpleAccent,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Which festival matches your personality?',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Take the quiz and earn +25 Karma! ✨',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.purpleAccent,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.arrow_forward_ios_rounded,
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
    );
  }
}
