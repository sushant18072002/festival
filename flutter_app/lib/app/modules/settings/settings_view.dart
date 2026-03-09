import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'settings_controller.dart';
import '../../data/providers/data_repository.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';

class SettingsView extends GetView<SettingsController> {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        title: Text('Settings', style: AppTextStyles.headlineMedium),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.md,
          AppSpacing.md,
          100,
        ),
        children: [
          // ─────────────────────────────────────────────────────────────────
          // Preferences Section
          // ─────────────────────────────────────────────────────────────────
          _buildSectionHeader('Preferences'),

          _buildNotificationPanel(),

          AppSpacing.verticalSm,

          _buildGlassSettingsTile(
            icon: Icons.filter_list_rounded,
            iconColor: AppColors.accent,
            child: ListTile(
              title: Text(
                'My Festivals',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Obx(
                () => Text(
                  '${controller.myFestivals.length} selected for priority alerts',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ),
              trailing: const Icon(
                Icons.chevron_right_rounded,
                color: Colors.white54,
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                _showFestivalsDialog();
              },
            ),
          ),

          AppSpacing.verticalSm,

          _buildGlassSettingsTile(
            icon: Icons.cloud_sync_rounded,
            iconColor: AppColors.info,
            child: Obx(() {
              final repo = Get.find<DataRepository>();
              return SwitchListTile(
                title: Text(
                  'Use Remote Data',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
                subtitle: Text(
                  repo.useRemote.value
                      ? 'Fetching from API'
                      : 'Using local assets',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
                value: repo.useRemote.value,
                activeTrackColor: AppColors.secondary,
                thumbColor: WidgetStateProperty.resolveWith<Color>(
                  (states) => states.contains(WidgetState.selected)
                      ? Colors.white
                      : Colors.white54,
                ),
                inactiveTrackColor: Colors.white10,
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
          _buildSectionHeader('Appearance'),

          _buildGlassSettingsTile(
            icon: Icons.brightness_6_rounded,
            iconColor: Colors.amberAccent,
            child: Obx(
              () => SwitchListTile(
                title: Text(
                  'Dark Mode',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
                subtitle: Text(
                  controller.isDarkMode.value
                      ? 'Using dark theme'
                      : 'Using light theme',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
                value: controller.isDarkMode.value,
                activeTrackColor: Colors.amberAccent.withValues(alpha: 0.7),
                thumbColor: WidgetStateProperty.resolveWith<Color>(
                  (states) => states.contains(WidgetState.selected)
                      ? Colors.white
                      : Colors.white54,
                ),
                inactiveTrackColor: Colors.white10,
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
          _buildSectionHeader('General'),

          _buildGlassSettingsTile(
            icon: Icons.language_rounded,
            iconColor: AppColors.primary,
            child: ListTile(
              title: Text(
                'Language',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Obx(
                () => Text(
                  _getLanguageName(controller.currentLang.value),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ),
              trailing: const Icon(
                Icons.chevron_right_rounded,
                color: Colors.white54,
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                _showLanguageDialog();
              },
            ),
          ),

          AppSpacing.verticalSm,

          _buildGlassSettingsTile(
            icon: Icons.privacy_tip_rounded,
            iconColor: AppColors.success,
            child: ListTile(
              title: Text(
                'Privacy Policy',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              trailing: const Icon(
                Icons.open_in_new_rounded,
                size: 18,
                color: Colors.white54,
              ),
              onTap: () {
                HapticFeedback.lightImpact();
                launchUrl(Uri.parse('https://utsav.app/privacy-policy'));
              },
            ),
          ),

          AppSpacing.verticalLg,

          // ─────────────────────────────────────────────────────────────────
          // Accessibility Section
          // ─────────────────────────────────────────────────────────────────
          _buildSectionHeader('Accessibility'),

          _buildGlassSettingsTile(
            icon: Icons.accessibility_new_rounded,
            iconColor: Colors.tealAccent,
            child: Column(
              children: [
                Obx(
                  () => SwitchListTile(
                    title: Text(
                      'High Contrast',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    value: controller.highContrast.value,
                    activeTrackColor: Colors.tealAccent.withValues(alpha: 0.7),
                    inactiveTrackColor: Colors.white10,
                    onChanged: (val) {
                      HapticFeedback.selectionClick();
                      controller.toggleHighContrast(val);
                    },
                  ),
                ),
                Divider(
                  color: Colors.white.withValues(alpha: 0.05),
                  height: 1,
                  indent: 16,
                  endIndent: 16,
                ),
                Obx(
                  () => SwitchListTile(
                    title: Text(
                      'Large Text',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    value: controller.largeText.value,
                    activeTrackColor: Colors.tealAccent.withValues(alpha: 0.7),
                    inactiveTrackColor: Colors.white10,
                    onChanged: (val) {
                      HapticFeedback.selectionClick();
                      controller.toggleLargeText(val);
                    },
                  ),
                ),
                Divider(
                  color: Colors.white.withValues(alpha: 0.05),
                  height: 1,
                  indent: 16,
                  endIndent: 16,
                ),
                Obx(
                  () => SwitchListTile(
                    title: Text(
                      'Reduce Animations',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    value: controller.reduceAnimations.value,
                    activeTrackColor: Colors.tealAccent.withValues(alpha: 0.7),
                    inactiveTrackColor: Colors.white10,
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
          _buildSectionHeader('Data Management'),

          _buildGlassSettingsTile(
            icon: Icons.delete_outline_rounded,
            iconColor: Colors.redAccent,
            child: ListTile(
              title: Text(
                'Clear Downloads Cache',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Obx(
                () => Text(
                  '${controller.cacheSize.value} used',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white70,
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

          _buildGlassSettingsTile(
            icon: Icons.calendar_month_rounded,
            iconColor: Colors.blueAccent,
            child: ListTile(
              title: Text(
                'Export My Calendar',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Text(
                'Export selected festivals to device calendar',
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
              ),
              trailing: const Icon(
                Icons.system_update_alt_rounded,
                color: Colors.white54,
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
          _buildSectionHeader('About'),

          _buildGlassSettingsTile(
            icon: Icons.celebration_rounded,
            iconColor: AppColors.accent,
            child: ListTile(
              title: Text(
                'Utsav',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Text(
                'Version 1.0.0',
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
              ),
              trailing: Text(
                '© 2024',
                style: AppTextStyles.labelSmall.copyWith(color: Colors.white38),
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
                  style: AppTextStyles.festive.copyWith(
                    fontSize: 40,
                    color: AppColors.primary,
                  ),
                ),
                AppSpacing.verticalXs,
                Text(
                  'Celebrate Indian Festivals',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: Colors.white54,
                  ),
                ),
              ],
            ),
          ).animate().fade(delay: 300.ms),

          // Bottom Padding
          const SizedBox(height: 100),
        ].animate(interval: 50.ms).fade().slideY(begin: 0.05),
      ),
    );
  }

  Widget _buildNotificationPanel() {
    return Obx(() {
      final masterOn = controller.notificationsEnabled.value;
      return GlassContainer(
        borderRadius: BorderRadius.circular(20),
        color: AppColors.surfaceGlass,
        opacity: 0.1,
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        child: Column(
          children: [
            // ── Master Toggle ──────────────────────────────────────────────
            SwitchListTile(
              secondary: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.notifications_active_rounded,
                  color: masterOn ? AppColors.secondary : Colors.white38,
                  size: 22,
                ),
              ),
              title: Text(
                'Festival Alerts',
                style: AppTextStyles.titleMedium.copyWith(color: Colors.white),
              ),
              subtitle: Text(
                masterOn
                    ? 'Keeping you in the festive spirit'
                    : 'All alerts disabled',
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white54),
              ),
              value: masterOn,
              activeTrackColor: AppColors.secondary,
              thumbColor: WidgetStateProperty.resolveWith<Color>(
                (states) => states.contains(WidgetState.selected)
                    ? Colors.white
                    : Colors.white54,
              ),
              inactiveTrackColor: Colors.white10,
              onChanged: (val) {
                HapticFeedback.selectionClick();
                controller.toggleNotifications(val);
              },
            ),

            // ── Sub-Toggles (visible only when master is ON) ───────────────
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              child: masterOn
                  ? Column(
                      children: [
                        Divider(
                          color: Colors.white.withValues(alpha: 0.07),
                          height: 1,
                          indent: AppSpacing.md,
                          endIndent: AppSpacing.md,
                        ),
                        _buildNotifSubToggle(
                          icon: Icons.celebration_rounded,
                          iconColor: const Color(0xFF8B5CF6),
                          title: 'Day-of Celebrations',
                          subtitle:
                              'Morning alerts on the festival day + eve reminder',
                          value: controller.festivalEventNotifs.value,
                          onChanged: controller.toggleFestivalEvents,
                        ),
                        _buildNotifSubToggle(
                          icon: Icons.hourglass_top_rounded,
                          iconColor: const Color(0xFFF59E0B),
                          title: 'Countdown Reminders',
                          subtitle: '30 days and 7 days before each festival',
                          value: controller.countdownNotifs.value,
                          onChanged: controller.toggleCountdown,
                        ),
                        _buildNotifSubToggle(
                          icon: Icons.view_week_rounded,
                          iconColor: const Color(0xFF06B6D4),
                          title: 'Weekly Digest',
                          subtitle: 'Every Sunday — what\'s coming this week',
                          value: controller.weeklyDigestNotifs.value,
                          onChanged: controller.toggleWeeklyDigest,
                        ),
                        _buildNotifSubToggle(
                          icon: Icons.calendar_month_rounded,
                          iconColor: const Color(0xFF10B981),
                          title: 'Monthly Opener',
                          subtitle: '1st of each month — festivals ahead',
                          value: controller.monthlyDigestNotifs.value,
                          onChanged: controller.toggleMonthlyDigest,
                          isLast: true,
                        ),
                      ],
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildNotifSubToggle({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool isLast = false,
  }) {
    return Column(
      children: [
        SwitchListTile(
          secondary: Icon(icon, color: iconColor, size: 20),
          title: Text(
            title,
            style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
          ),
          subtitle: Text(
            subtitle,
            style: AppTextStyles.bodySmall.copyWith(color: Colors.white54),
          ),
          value: value,
          activeTrackColor: iconColor.withValues(alpha: 0.7),
          thumbColor: WidgetStateProperty.resolveWith<Color>(
            (states) => states.contains(WidgetState.selected)
                ? Colors.white
                : Colors.white54,
          ),
          inactiveTrackColor: Colors.white10,
          dense: true,
          onChanged: (val) {
            HapticFeedback.selectionClick();
            onChanged(val);
          },
        ),
        if (!isLast)
          Divider(
            color: Colors.white.withValues(alpha: 0.05),
            height: 1,
            indent: AppSpacing.xl,
            endIndent: AppSpacing.md,
          ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(
        left: AppSpacing.xs,
        bottom: AppSpacing.xs,
        top: AppSpacing.xs,
      ),
      child: Text(
        title.toUpperCase(),
        style: AppTextStyles.labelMedium.copyWith(
          color: AppColors.primary,
          letterSpacing: 1.2,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildGlassSettingsTile({
    required IconData icon,
    required Color iconColor,
    required Widget child,
  }) {
    return GlassContainer(
      borderRadius: BorderRadius.circular(20),
      color: AppColors.surfaceGlass,
      opacity: 0.1,
      border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      child: Row(
        children: [
          // Icon Container
          Container(
            margin: const EdgeInsets.all(AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          // Content
          Expanded(child: child),
        ],
      ),
    );
  }

  void _showLanguageDialog() {
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
          color: AppColors.backgroundDark,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppRadius.xl),
          ),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
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
                color: Colors.white24,
                borderRadius: AppRadius.pillRadius,
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Text(
                'Select Language',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: Colors.white,
                ),
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
                          ? const Icon(
                              Icons.check_circle,
                              color: AppColors.primary,
                            )
                          : const Icon(Icons.language, color: Colors.white38),
                      title: Text(
                        entry.value,
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: isSelected
                              ? AppColors.primary
                              : Colors.white70,
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

  String _getLanguageName(String code) {
    const names = {
      'en': 'English',
      'hi': 'हिंदी',
      'mr': 'मराठी',
      'gu': 'ગુજરાતી',
      'bn': 'বাংলা',
      'ta': 'தமிழ்',
      'te': 'తెలుగు',
      'kn': 'ಕನ್ನಡ',
      'ml': 'മലയാളം',
    };
    return names[code] ?? code.toUpperCase();
  }

  void _showFestivalsDialog() {
    Get.bottomSheet(
      Container(
        decoration: BoxDecoration(
          color: AppColors.backgroundDark,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppRadius.xl),
          ),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: AppRadius.pillRadius,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Text(
                'My Festivals',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: Colors.white,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Text(
                'Select the festivals you care about most. We\'ll prioritize them in your feed and notifications.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Obx(() {
                final repo = Get.find<DataRepository>();
                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: repo.allEvents.length,
                  itemBuilder: (context, index) {
                    final event = repo.allEvents[index];
                    final isSelected = controller.myFestivals.contains(
                      event.id,
                    );
                    return CheckboxListTile(
                      title: Text(
                        event.title,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: Colors.white,
                        ),
                      ),
                      subtitle: Text(
                        event.date != null
                            ? '${event.date!.day}/${event.date!.month}/${event.date!.year}'
                            : '',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white54,
                        ),
                      ),
                      value: isSelected,
                      activeColor: AppColors.primary,
                      checkColor: Colors.black,
                      onChanged: (_) {
                        HapticFeedback.selectionClick();
                        controller.toggleFestivalSelection(event.id);
                      },
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
