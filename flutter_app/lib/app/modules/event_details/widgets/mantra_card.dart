import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../data/models/mantra_model.dart';

/// Mantra (Chant) Card — displays the sacred text, transliteration, and meaning.
/// Adapts to both Light and Dark mode.
/// Hidden entirely when mantra is null (call site handles the guard).
class MantraCard extends StatelessWidget {
  final MantraModel mantra;

  const MantraCard({super.key, required this.mantra});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF0A1416).withValues(alpha: 0.8)
            : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: AppColors.adaptiveBorder(context),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.flower2,
                  color: AppColors.primaryAdaptive(context),
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Sacred Chant',
                style: AppTextStyles.labelMedium(context).copyWith(
                  color: AppColors.primaryAdaptive(context),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Main Mantra Text (Sanskrit / original script)
          if (mantra.text.isNotEmpty)
            Text(
              mantra.text,
              textAlign: TextAlign.center,
              style: AppTextStyles.headlineMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                height: 1.7,
                fontSize: 18,
                letterSpacing: 0.5,
              ),
            ),

          // Transliteration
          if (mantra.transliteration.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(
              mantra.transliteration,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
                fontStyle: FontStyle.italic,
                height: 1.6,
              ),
            ),
          ],

          // Meaning / Divider
          if (mantra.meaning.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 1,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.07)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Icon(
                      LucideIcons.flower,
                      color: AppColors.textAdaptiveSecondary(
                        context,
                      ).withValues(alpha: 0.4),
                      size: 16,
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.07)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '"${mantra.meaning}"',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
                fontWeight: FontWeight.w500,
                height: 1.6,
              ),
            ),
          ],

          const SizedBox(height: 20),

          // Copy Button
          OutlinedButton.icon(
            onPressed: () {
              HapticFeedback.lightImpact();
              final textToCopy =
                  '${mantra.text}\n${mantra.transliteration}\nMeaning: ${mantra.meaning}';
              Clipboard.setData(ClipboardData(text: textToCopy));
              Get.snackbar(
                '🙏 Copied',
                'Mantra copied to clipboard',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: AppColors.primaryAdaptive(context).withValues(alpha: 0.9),
                colorText: isDark ? Colors.black : Colors.white,
                margin: const EdgeInsets.all(16),
                borderRadius: 14,
              );
            },
            icon: const Icon(LucideIcons.copy, size: 16),
            label: const Text(
              'COPY MANTRA',
              style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.bold),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primaryAdaptive(context),
              side: BorderSide(color: AppColors.primaryAdaptive(context).withValues(alpha: 0.4)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
          ),
        ],
      ),
    ).animate().fade().scale(begin: const Offset(0.96, 0.96));
  }
}
