import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_text_styles.dart';
import '../profile_controller.dart';

class TrophyGrid extends StatelessWidget {
  final ProfileController controller;

  const TrophyGrid({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.emoji_events, color: Colors.amber, size: 24),
            const SizedBox(width: 8),
            Text(
              'Trophy Case',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
          ],
        ).animate(delay: 800.ms).fade(),
        const SizedBox(height: 16),
        GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            crossAxisSpacing: 12,
            mainAxisSpacing: 16,
            childAspectRatio: 0.75,
          ),
          itemCount: controller.allTrophies.length,
          itemBuilder: (context, index) {
            final trophy = controller.allTrophies[index];
            final earned = trophy['earned'] as bool;
            return Column(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: earned
                            ? Colors.amber.withValues(alpha: 0.15)
                            : Colors.white.withValues(alpha: 0.05),
                        border: Border.all(
                          color: earned
                              ? Colors.amber.withValues(alpha: 0.5)
                              : Colors.white12,
                          width: earned ? 2 : 1,
                        ),
                        boxShadow: earned
                            ? [
                                BoxShadow(
                                  color: Colors.amber.withValues(alpha: 0.2),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        earned ? trophy['icon'] : '🔒',
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      trophy['name'],
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: earned ? Colors.white : Colors.white38,
                        fontSize: 10,
                        fontWeight: earned
                            ? FontWeight.bold
                            : FontWeight.normal,
                        height: 1.2,
                      ),
                    ),
                  ],
                )
                .animate(delay: (900 + index * 50).ms)
                .scale(curve: Curves.easeOutBack);
          },
        ),
      ],
    );
  }
}
