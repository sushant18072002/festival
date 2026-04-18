import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'settings_controller.dart';
import '../../data/providers/data_repository.dart';
import '../../widgets/neo_scaffold.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../routes/app_pages.dart';

import 'widgets/settings_section_header.dart';
import 'widgets/settings_glass_tile.dart';
import 'widgets/settings_notification_panel.dart';
import 'widgets/settings_dialogs.dart';

class SettingsView extends GetView<SettingsController> {
  const SettingsView({super.key});

  String _getLanguageName(String code) {
    final map = {
      'en': 'English',
      'hi': 'Hindi',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'bn': 'Bengali',
      'ta': 'Tamil',
      'te': 'Telugu',
      'kn': 'Kannada',
      'ml': 'Malayalam',
    };
    return map[code] ?? 'English';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return NeoScaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => Get.back(),
        ),
        backgroundColor: isDark
            ? AppColors.backgroundDark.withValues(alpha: 0.95)
            : AppColors.backgroundLight.withValues(alpha: 0.97),
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        title: Text(
          'settings'.tr,
          style: AppTextStyles.headlineMedium(context).copyWith(
            color: AppColors.textAdaptive(context),
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
          AppSpacing.md,
          MediaQuery.of(context).padding.top + kToolbarHeight + AppSpacing.md,
          AppSpacing.md,
          100,
        ),
        children: [
          // ─────────────────────────────────────────────────────────────────
          // Preferences Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_preferences'.tr),

          const SettingsNotificationPanel(),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.listFilter,
            iconColor: AppColors.accentAdaptive(context),
            child: ListTile(
              title: Text(
                'My Festivals',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Obx(
                () => Text(
                  '${controller.myFestivals.length} selected for priority alerts',
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
              ),
              trailing: Icon(
                LucideIcons.chevronRight,
                color: AppColors.textAdaptiveSecondary(context),
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                SettingsDialogs.showFestivalsDialog(context, controller);
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.cloudCog,
            iconColor: AppColors.info,
            child: Obx(() {
              final repo = Get.find<DataRepository>();
              return SwitchListTile(
                title: Text(
                  'Use Remote Data',
                  style: AppTextStyles.titleMedium(context).copyWith(
                    color: AppColors.textAdaptive(context),
                  ),
                ),
                subtitle: Text(
                  repo.useRemote.value
                      ? 'Fetching from API'
                      : 'Using local assets',
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
                value: repo.useRemote.value,
                activeTrackColor: AppColors.secondaryAdaptive(context),
                thumbColor: AppColors.switchThumbColor(context),
                inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
                onChanged: (val) {
                  HapticFeedback.selectionClick();
                  controller.toggleRemote(val);
                },
              );
            }),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // Appearance Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_appearance'.tr),

          SettingsGlassTile(
            icon: LucideIcons.moonStar,
            iconColor: AppColors.accentAdaptive(context),
            child: Obx(
              () => SwitchListTile(
                title: Text(
                  'Dark Mode',
                  style: AppTextStyles.titleMedium(context).copyWith(
                    color: AppColors.textAdaptive(context),
                  ),
                ),
                subtitle: Text(
                  controller.isDarkMode.value
                      ? 'Using dark theme'
                      : 'Using light theme',
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
                value: controller.isDarkMode.value,
                activeTrackColor: AppColors.accentAdaptive(context).withValues(alpha: 0.7),
                thumbColor: AppColors.switchThumbColor(context),
                inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
                onChanged: (val) {
                  HapticFeedback.selectionClick();
                  controller.toggleTheme(val);
                },
              ),
            ),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // General Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_general'.tr),

          SettingsGlassTile(
            icon: LucideIcons.globe,
            iconColor: AppColors.primaryAdaptive(context),
            child: ListTile(
              title: Text(
                'Language',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Obx(
                () => Text(
                  _getLanguageName(controller.currentLang.value),
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
              ),
              trailing: Icon(
                LucideIcons.chevronRight,
                color: AppColors.textAdaptiveSecondary(context),
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                SettingsDialogs.showLanguageDialog(context, controller);
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.shieldCheck,
            iconColor: AppColors.success,
            child: ListTile(
              title: Text(
                'Privacy Policy',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              trailing: Icon(
                LucideIcons.chevronRight,
                size: 20,
                color: AppColors.textAdaptiveSecondary(context),
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                Get.toNamed(Routes.privacyPolicy);
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.scale,
            iconColor: AppColors.accentAdaptive(context),
            child: ListTile(
              title: Text(
                'Terms of Service',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              trailing: Icon(
                LucideIcons.chevronRight,
                size: 20,
                color: AppColors.textAdaptiveSecondary(context),
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                Get.toNamed(Routes.termsOfService);
              },
            ),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // Accessibility Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_accessibility'.tr),

          SettingsGlassTile(
            icon: LucideIcons.accessibility,
            iconColor: AppColors.accessibilityAccent(context),
            child: Column(
              children: [
                Obx(
                  () => SwitchListTile(
                    secondary: Icon(
                      LucideIcons.contrast,
                      color: controller.highContrast.value
                          ? AppColors.accessibilityAccent(context)
                          : AppColors.textAdaptiveSecondary(context),
                      size: 20,
                    ),
                    title: Text(
                      'High Contrast',
                      style: AppTextStyles.titleMedium(context).copyWith(
                        color: AppColors.textAdaptive(context),
                      ),
                    ),
                    subtitle: Text(
                      'Increases color contrast for readability',
                      style: AppTextStyles.bodySmall(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                      ),
                    ),
                    value: controller.highContrast.value,
                    activeTrackColor: AppColors.accessibilityAccent(context).withValues(alpha: 0.7),
                    inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
                    thumbColor: AppColors.switchThumbColor(context),
                    onChanged: (val) {
                      HapticFeedback.selectionClick();
                      controller.toggleHighContrast(val);
                    },
                  ),
                ),
                Divider(
                  color: AppColors.glassBorder(context),
                  height: 1,
                  indent: 16,
                  endIndent: 16,
                ),
                Obx(
                  () => SwitchListTile(
                    secondary: Icon(
                      LucideIcons.type,
                      color: controller.largeText.value
                          ? AppColors.accessibilityAccent(context)
                          : AppColors.textAdaptiveSecondary(context),
                      size: 20,
                    ),
                    title: Text(
                      'Large Text',
                      style: AppTextStyles.titleMedium(context).copyWith(
                        color: AppColors.textAdaptive(context),
                      ),
                    ),
                    subtitle: Text(
                      'Increases font sizes across the app',
                      style: AppTextStyles.bodySmall(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                      ),
                    ),
                    value: controller.largeText.value,
                    activeTrackColor: AppColors.accessibilityAccent(context).withValues(alpha: 0.7),
                    inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
                    thumbColor: AppColors.switchThumbColor(context),
                    onChanged: (val) {
                      HapticFeedback.selectionClick();
                      controller.toggleLargeText(val);
                    },
                  ),
                ),
                Divider(
                  color: AppColors.glassBorder(context),
                  height: 1,
                  indent: 16,
                  endIndent: 16,
                ),
                Obx(
                  () => SwitchListTile(
                    secondary: Icon(
                      LucideIcons.film,
                      color: controller.reduceAnimations.value
                          ? AppColors.accessibilityAccent(context)
                          : AppColors.textAdaptiveSecondary(context),
                      size: 20,
                    ),
                    title: Text(
                      'Reduce Animations',
                      style: AppTextStyles.titleMedium(context).copyWith(
                        color: AppColors.textAdaptive(context),
                      ),
                    ),
                    subtitle: Text(
                      'Minimizes motion for comfort',
                      style: AppTextStyles.bodySmall(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                      ),
                    ),
                    value: controller.reduceAnimations.value,
                    activeTrackColor: AppColors.accessibilityAccent(context).withValues(alpha: 0.7),
                    inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
                    thumbColor: AppColors.switchThumbColor(context),
                    onChanged: (val) {
                      HapticFeedback.selectionClick();
                      controller.toggleReduceAnimations(val);
                    },
                  ),
                ),
              ],
            ),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // Data Management Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_data'.tr),

          SettingsGlassTile(
            icon: LucideIcons.trash2,
            iconColor: AppColors.errorAdaptive(context),
            child: ListTile(
              title: Text(
                'Clear Downloads Cache',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Obx(
                () => Text(
                  '${controller.cacheSize.value} used',
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
              ),
              onTap: () {
                HapticFeedback.mediumImpact();
                controller.clearCache();
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.folderX,
            iconColor: AppColors.error,
            child: ListTile(
              title: Text(
                'Clear All Data',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                'Reset your streaks, karma, and settings',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              onTap: () {
                HapticFeedback.heavyImpact();
                SettingsDialogs.showClearDataDialog(context, controller);
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.calendarDays,
            iconColor: AppColors.info,
            child: ListTile(
              title: Text(
                'Export My Calendar',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                'Export selected festivals to device calendar',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              trailing: Icon(
                LucideIcons.download,
                color: AppColors.textAdaptiveSecondary(context),
                size: 20,
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                controller.exportCalendar();
              },
            ),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // About Section
          // ─────────────────────────────────────────────────────────────────
          SettingsSectionHeader(title: 'settings_about'.tr),

          SettingsGlassTile(
            icon: LucideIcons.headset,
            iconColor: AppColors.info,
            child: ListTile(
              title: Text(
                'Contact Support',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                'Report bugs or suggest features',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              trailing: Icon(
                LucideIcons.mail,
                color: AppColors.textAdaptiveSecondary(context),
                size: 20,
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                launchUrl(
                  Uri.parse('mailto:support@utsav.app?subject=Utsav Support'),
                );
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.star,
            iconColor: AppColors.accentAdaptive(context),
            child: ListTile(
              title: Text(
                'Rate Utsav',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                'Love the app? Let us know!',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              trailing: Icon(
                LucideIcons.heart,
                color: AppColors.error.withValues(alpha: 0.8),
                size: 20,
              ),
              onTap: () {
                HapticFeedback.mediumImpact();
                Get.snackbar(
                  'Thank You!',
                  'We appreciate your support ❤️',
                  snackPosition: SnackPosition.BOTTOM,
                  backgroundColor: AppColors.accentAdaptive(context).withValues(alpha: 0.2),
                  colorText: AppColors.textAdaptive(context),
                );
              },
            ),
          ),

          AppSpacing.verticalSm,

          SettingsGlassTile(
            icon: LucideIcons.partyPopper,
            iconColor: AppColors.accentAdaptive(context),
            child: ListTile(
              title: Text(
                'Utsav',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                'Version 1.0.0',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              trailing: Text(
                '© 2024',
                style: AppTextStyles.labelSmall(context).copyWith(
                  color: AppColors.glassBorder(context),
                ),
              ),
            ),
          ),

          AppSpacing.verticalXl,

          // App Branding
          Center(
            child: Column(
              children: [
                Text(
                  'Utsav',
                  style: AppTextStyles.festive(context).copyWith(
                    fontSize: 40,
                    color: AppColors.primaryAdaptive(context),
                  ),
                ),
                AppSpacing.verticalXs,
                Text(
                  'Celebrate Indian Festivals',
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                  ),
                ),
              ],
            ),
          ).animate().fade(delay: 300.ms),

          // Bottom Padding
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}
