import 'package:app_festival/app/data/providers/data_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../settings_controller.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class SettingsDialogs {
  static void showLanguageDialog(
    BuildContext context,
    SettingsController controller,
  ) {
    final languages = {
      'en': 'English',
      'hi': 'हिंदी (Hindi)',
      'mr': 'मराठी (Marathi)',
      'gu': 'ગુજરાતી (Gujarati)',
      'bn': 'বাংলা (Bengali)',
      'ta': 'தமிழ் (Tamil)',
      'te': 'తెలుగు (Telugu)',
      'kn': 'ಕನ್ನಡ (Kannada)',
      'ml': 'മലയാളം (Malayalam)',
    };

    Get.bottomSheet(
      Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppRadius.xl),
          ),
          border: Border.all(color: AppColors.glassBorder(context)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag Handle
            Container(
              margin: const EdgeInsets.only(top: AppSpacing.sm),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.glassBorder(context),
                borderRadius: AppRadius.pillRadius,
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Text(
                'Select Language',
                style: AppTextStyles.headlineSmall(
                  context,
                ).copyWith(color: AppColors.textAdaptive(context)),
              ),
            ),

            // Language List
            Flexible(
              child: ListView(
                shrinkWrap: true,
                children: languages.entries.map((entry) {
                  return Obx(() {
                    final isSelected =
                        controller.currentLang.value == entry.key;
                    return ListTile(
                      leading: isSelected
                          ? Icon(
                              LucideIcons.circleCheck,
                              color: AppColors.primaryAdaptive(context),
                            )
                          : Icon(
                              LucideIcons.globe,
                              color: AppColors.textAdaptiveSecondary(context),
                            ),
                      title: Text(
                        entry.value,
                        style: AppTextStyles.bodyLarge(context).copyWith(
                          color: isSelected
                              ? AppColors.primaryAdaptive(context)
                              : AppColors.textAdaptive(context),
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      onTap: () {
                        HapticFeedback.selectionClick();
                        controller.changeLanguage(entry.key);
                        Get.back();
                      },
                    );
                  });
                }).toList(),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  static void showFestivalsDialog(
    BuildContext context,
    SettingsController controller,
  ) {
    Get.bottomSheet(
      Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppRadius.xl),
          ),
          border: Border.all(color: AppColors.glassBorder(context)),
        ),
        child: Column(
          children: [
            // Drag Handle
            Container(
              margin: const EdgeInsets.only(top: AppSpacing.sm),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.glassBorder(context),
                borderRadius: AppRadius.pillRadius,
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'My Festivals',
                          style: AppTextStyles.headlineSmall(
                            context,
                          ).copyWith(color: AppColors.textAdaptive(context)),
                        ),
                        Text(
                          'Select to prioritize in alerts',
                          style: AppTextStyles.bodySmall(context).copyWith(
                            color: AppColors.textAdaptiveSecondary(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text(
                      'Done',
                      style: AppTextStyles.titleMedium(
                        context,
                      ).copyWith(color: AppColors.primaryAdaptive(context)),
                    ),
                  ),
                ],
              ),
            ),

            Divider(color: AppColors.glassBorder(context), height: 1),

            // List
            Expanded(
              child: Obx(() {
                final repo = Get.find<DataRepository>();
                return ListView.separated(
                  itemCount: repo.allEvents.length,
                  separatorBuilder: (_, __) => Divider(
                    color: AppColors.glassBorder(context),
                    height: 1,
                    indent: 52,
                  ),
                  itemBuilder: (context, index) {
                    final fest = repo.allEvents[index];
                    final isSelected = controller.myFestivals.contains(fest.id);

                    return ListTile(
                      leading: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected
                              ? AppColors.primaryAdaptive(context)
                              : Colors.transparent,
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primaryAdaptive(context)
                                : AppColors.textAdaptiveSecondary(context),
                            width: 2,
                          ),
                        ),
                      ),
                      title: Text(
                        fest.title,
                        style: AppTextStyles.bodyLarge(
                          context,
                        ).copyWith(color: AppColors.textAdaptive(context)),
                      ),
                      trailing: isSelected
                          ? Icon(
                              LucideIcons.check,
                              color: AppColors.successAdaptive(context),
                            )
                          : null,
                      onTap: () {
                        HapticFeedback.selectionClick();
                        controller.toggleFestivalSelection(fest.id);
                      },
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  static void showClearDataDialog(
    BuildContext context,
    SettingsController controller,
  ) {
    Get.dialog(
      AlertDialog(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: AppColors.glassBorder(context)),
        ),
        title: Row(
          children: [
            Icon(LucideIcons.triangleAlert, color: AppColors.errorAdaptive(context)),
            const SizedBox(width: 8),
            Text(
              'Reset All Data?',
              style: AppTextStyles.headlineSmall(
                context,
              ).copyWith(color: AppColors.textAdaptive(context)),
            ),
          ],
        ),
        content: Text(
          'This will wipe your streaks, karma points, chosen festivals, and cached images. This action cannot be undone.',
          style: AppTextStyles.bodyMedium(
            context,
          ).copyWith(color: AppColors.textAdaptiveSecondary(context)),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text(
              'Cancel',
              style: AppTextStyles.titleMedium(
                context,
              ).copyWith(color: AppColors.textAdaptiveSecondary(context)),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.errorAdaptive(context),
              foregroundColor: AppColors.textLight,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () {
              HapticFeedback.heavyImpact();
              controller.clearAllData();
              Get.back();
              Get.snackbar(
                'Data Cleared',
                'Your app acts as a blank slate now.',
                backgroundColor: AppColors.errorAdaptive(
                  context,
                ).withValues(alpha: 0.2),
                colorText: AppColors.textAdaptive(context),
                snackPosition: SnackPosition.BOTTOM,
              );
            },
            child: const Text('Wipe Data'),
          ),
        ],
      ),
    );
  }
}
