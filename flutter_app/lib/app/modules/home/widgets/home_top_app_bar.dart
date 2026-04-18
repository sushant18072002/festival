import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../routes/app_pages.dart';
import '../../home/home_controller.dart';
import '../../profile/profile_controller.dart';
import 'language_picker_sheet.dart';

/// Home top app bar — matches the screenshot layout:
///  LEFT:  ✦ UTSAV FESTIVAL (brand row)
///  RIGHT: [A/अ HI ▼] [🔔] [avatar]
class HomeTopAppBar extends StatelessWidget {
  final HomeController controller;

  const HomeTopAppBar({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final onSurface = Theme.of(context).colorScheme.onSurface;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // ── LEFT: Brand ─────────────────────────────────────────────────────
        _BrandMark(isDark: isDark, onSurface: onSurface),

        const Spacer(),

        // ── RIGHT: Language pill + Bell + Avatar ───────────────────────────
        Row(
          children: [
            // Language pill
            _LanguagePill(
              controller: controller,
              isDark: isDark,
              onSurface: onSurface,
            ),
            const SizedBox(width: 8),

            // Bell button
            _IconCircle(
              isDark: isDark,
              onSurface: onSurface,
              onTap: () {
                HapticFeedback.lightImpact();
                Get.snackbar(
                  '🔔 Notifications',
                  'Coming soon — stay tuned!',
                  snackPosition: SnackPosition.TOP,
                  duration: const Duration(seconds: 2),
                  backgroundColor: isDark
                      ? AppColors.surfaceGlass(context)
                      : Colors.white,
                  colorText: onSurface,
                  margin: const EdgeInsets.all(16),
                  borderRadius: 16,
                );
              },
              child: Icon(
                LucideIcons.bell,
                size: 18,
                color: isDark ? Colors.white : onSurface,
              ),
            ),
            const SizedBox(width: 8),

            // Avatar
            _AvatarButton(isDark: isDark),
          ],
        ),
      ],
    ).animate().fade(duration: 700.ms);
  }
}

// ── Brand mark: ✦ UTSAV FESTIVAL ──────────────────────────────────────────
class _BrandMark extends StatelessWidget {
  final bool isDark;
  final Color onSurface;

  const _BrandMark({required this.isDark, required this.onSurface});

  @override
  Widget build(BuildContext context) {
    final labelColor = isDark
        ? Colors.white70
        : onSurface.withValues(alpha: 0.55);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Sparkle icon
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [
              AppColors.primaryAdaptive(context),
              AppColors.secondaryAdaptive(context),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(bounds),
          child: const Icon(
            LucideIcons.sparkles,
            size: 14,
            color: Colors.white, // required by ShaderMask
          ),
        ),
        const SizedBox(width: 6),
        Text(
          'UTSAV FESTIVAL',
          style: AppTextStyles.labelSmall(context).copyWith(
            color: labelColor,
            fontSize: 12,
            letterSpacing: 1.8,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// ── Language pill: [A/अ HI ▼] ─────────────────────────────────────────────
class _LanguagePill extends StatelessWidget {
  final HomeController controller;
  final bool isDark;
  final Color onSurface;

  const _LanguagePill({
    required this.controller,
    required this.isDark,
    required this.onSurface,
  });

  /// Maps language code → display label shown in the pill
  static const _langLabels = {
    'en': 'EN',
    'hi': 'HI',
    'mr': 'MR',
    'gu': 'GU',
    'bn': 'BN',
    'ta': 'TA',
    'te': 'TE',
    'kn': 'KN',
    'ml': 'ML',
  };

  /// Maps language code → its native script initial shown in front of the slash
  static const _langScripts = {
    'en': 'A',
    'hi': 'अ',
    'mr': 'म',
    'gu': 'ગ',
    'bn': 'অ',
    'ta': 'அ',
    'te': 'అ',
    'kn': 'ಅ',
    'ml': 'അ',
  };

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final code = controller.currentLang.value;
      final script = _langScripts[code] ?? 'A';
      final label = _langLabels[code] ?? code.toUpperCase();

      final pillBg = isDark
          ? AppColors.surfaceGlass(context).withValues(alpha: 0.8)
          : Colors.black.withValues(alpha: 0.07);
      final pillBorder = AppColors.glassBorder(context);
      final textColor = isDark ? Colors.white : onSurface;

      return GestureDetector(
        onTap: () => showLanguagePickerSheet(context, controller),
        child: Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: pillBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: pillBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$script/A',
                style: AppTextStyles.labelMedium(context).copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                  fontFamily: 'Outfit',
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: AppTextStyles.labelMedium(context).copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: textColor,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(width: 3),
              Icon(
                LucideIcons.chevronDown,
                size: 16,
                color: textColor.withValues(alpha: 0.7),
              ),
            ],
          ),
        ),
      );
    });
  }
}

// ── Generic icon circle button ─────────────────────────────────────────────
class _IconCircle extends StatelessWidget {
  final bool isDark;
  final Color onSurface;
  final VoidCallback onTap;
  final Widget child;

  const _IconCircle({
    required this.isDark,
    required this.onSurface,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.10)
              : Colors.black.withValues(alpha: 0.06),
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.glassBorder(context)),
        ),
        child: Center(child: child),
      ),
    );
  }
}

// ── Circular avatar with gradient glow ────────────────────────────────────
class _AvatarButton extends StatelessWidget {
  final bool isDark;

  const _AvatarButton({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        Get.toNamed(Routes.profile);
      },
      child: Obx(() {
        if (!Get.isRegistered<ProfileController>()) {
          // Placeholder circle while profile loads
          return Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  AppColors.primaryAdaptive(context),
                  AppColors.secondaryAdaptive(context),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          );
        }
        final profileController = Get.find<ProfileController>();
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [
                AppColors.primaryAdaptive(context),
                AppColors.secondaryAdaptive(context),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryAdaptive(
                  context,
                ).withValues(alpha: isDark ? 0.45 : 0.25),
                blurRadius: 12,
                spreadRadius: -2,
              ),
            ],
          ),
          padding: const EdgeInsets.all(2),
          child: ClipOval(
            child: Image.asset(
              profileController.selectedAvatar.value,
              fit: BoxFit.cover,
            ),
          ),
        );
      }),
    );
  }
}
