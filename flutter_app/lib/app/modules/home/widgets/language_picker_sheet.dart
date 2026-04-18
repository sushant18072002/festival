import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../home_controller.dart';

/// Language picker bottom sheet — opened by the language pill in the home header.
/// Shows all 9 supported languages in a 3-column grid.
void showLanguagePickerSheet(BuildContext context, HomeController controller) {
  HapticFeedback.lightImpact();
  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (_) => LanguagePickerSheet(controller: controller),
  );
}

class LanguagePickerSheet extends StatelessWidget {
  final HomeController controller;

  const LanguagePickerSheet({super.key, required this.controller});

  static const _languages = [
    _Lang('en', 'English', 'A'),
    _Lang('hi', 'हिंदी', 'अ'),
    _Lang('mr', 'मराठी', 'म'),
    _Lang('gu', 'ગુજ', 'ગ'),
    _Lang('bn', 'বাংলা', 'ব'),
    _Lang('ta', 'தமிழ்', 'த'),
    _Lang('te', 'తెలుగు', 'తె'),
    _Lang('kn', 'ಕನ್ನಡ', 'ಕ'),
    _Lang('ml', 'മലയാളം', 'മ'),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF1A0B2E) : Colors.white;
    final borderColor = AppColors.glassBorder(context);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: borderColor, width: 1)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.2)
                  : Colors.black.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Title row
          Row(
            children: [
              Text(
                'Select Language',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              // Close button
              GestureDetector(
                onTap: () => Get.back(),
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.black.withValues(alpha: 0.06),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    LucideIcons.x,
                    size: 16,
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Language grid
          Obx(() {
            final current = controller.currentLang.value;
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.4,
              ),
              itemCount: _languages.length,
              itemBuilder: (_, i) {
                final lang = _languages[i];
                final isSelected = current == lang.code;
                return _LanguageTile(
                  lang: lang,
                  isSelected: isSelected,
                  isDark: isDark,
                  onTap: () {
                    HapticFeedback.selectionClick();
                    controller.changeLanguage(lang.code);
                    Get.back();
                  },
                );
              },
            );
          }),
        ],
      ),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  final _Lang lang;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _LanguageTile({
    required this.lang,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final onSurface = Theme.of(context).colorScheme.onSurface;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.15)
              : isDark
              ? Colors.white.withValues(alpha: 0.05)
              : Colors.black.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : isDark
                ? Colors.white.withValues(alpha: 0.10)
                : Colors.black.withValues(alpha: 0.08),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Script character
            Text(
              lang.script,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: isSelected
                    ? AppColors.primary
                    : onSurface.withValues(alpha: 0.7),
                fontFamily: 'Outfit',
              ),
            ),
            const SizedBox(height: 4),
            // Language name
            Text(
              lang.name,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? AppColors.primary
                    : onSurface.withValues(alpha: 0.6),
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _Lang {
  final String code;
  final String name;
  final String script;

  const _Lang(this.code, this.name, this.script);
}
