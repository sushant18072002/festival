import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../data/models/mantra_model.dart';

class MantraCard extends StatelessWidget {
  final MantraModel mantra;

  const MantraCard({super.key, required this.mantra});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        image: const DecorationImage(
          image: AssetImage('assets/images/noise.png'),
          opacity: 0.05,
          fit: BoxFit.cover,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(
            Icons.self_improvement_rounded,
            color: AppColors.accent,
            size: 28,
          ),
          const SizedBox(height: 16),
          if (mantra.text.isNotEmpty)
            Text(
              mantra.text,
              textAlign: TextAlign.center,
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.accent,
                height: 1.6,
                fontSize: 18,
              ),
            ),
          if (mantra.transliteration.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              mantra.transliteration,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.white70,
                fontStyle: FontStyle.italic,
                height: 1.5,
              ),
            ),
          ],
          if (mantra.meaning.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(color: Colors.white12),
            ),
            Text(
              '"${mantra.meaning}"',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w500,
                height: 1.5,
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton.icon(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  final textToCopy =
                      '${mantra.text}\n${mantra.transliteration}\nMeaning: ${mantra.meaning}';
                  Clipboard.setData(ClipboardData(text: textToCopy));
                  Get.snackbar(
                    'Copied',
                    'Mantra copied to clipboard',
                    snackPosition: SnackPosition.BOTTOM,
                  );
                },
                icon: const Icon(Icons.copy_rounded, size: 16),
                label: const Text('COPY', style: TextStyle(letterSpacing: 1.2)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white70,
                  side: const BorderSide(color: Colors.white24),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fade().scale(begin: const Offset(0.95, 0.95));
  }
}
