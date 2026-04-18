import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../settings_controller.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';

class SettingsNotificationPanel extends StatelessWidget {
  const SettingsNotificationPanel({super.key});

  Widget _buildNotifSubToggle({
    required BuildContext context,
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
            style: AppTextStyles.bodyMedium(context).copyWith(
              color: AppColors.textAdaptive(context),
            ),
          ),
          subtitle: Text(
            subtitle,
            style: AppTextStyles.bodySmall(context).copyWith(
              color: AppColors.textAdaptiveSecondary(context),
            ),
          ),
          value: value,
          activeTrackColor: iconColor.withValues(alpha: 0.7),
          thumbColor: AppColors.switchThumbColor(context),
          inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
          dense: true,
          onChanged: (val) {
            HapticFeedback.selectionClick();
            onChanged(val);
          },
        ),
        if (!isLast)
          Divider(
            color: AppColors.glassBorder(context),
            height: 1,
            indent: AppSpacing.xl,
            endIndent: AppSpacing.md,
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<SettingsController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Obx(() {
      final masterOn = controller.notificationsEnabled.value;
      return GlassContainer(
        borderRadius: BorderRadius.circular(20),
        color: AppColors.surfaceGlass(context),
        opacity: 0.1,
        border: Border.all(color: AppColors.glassBorder(context)),
        child: Column(
          children: [
            // ── Master Toggle ──────────────────────────────────────────────
            SwitchListTile(
              secondary: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.secondaryAdaptive(context).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  LucideIcons.bellRing,
                  color: masterOn
                      ? AppColors.secondaryAdaptive(context)
                      : AppColors.textAdaptiveSecondary(context),
                  size: 22,
                ),
              ),
              title: Text(
                'Festival Alerts',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              subtitle: Text(
                masterOn
                    ? 'Keeping you in the festive spirit'
                    : 'All alerts disabled',
                style: AppTextStyles.bodySmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                ),
              ),
              value: masterOn,
              activeTrackColor: AppColors.secondaryAdaptive(context),
              thumbColor: AppColors.switchThumbColor(context),
              inactiveTrackColor: AppColors.switchInactiveTrackColor(context),
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
                          color: AppColors.glassBorder(context),
                          height: 1,
                          indent: AppSpacing.md,
                          endIndent: AppSpacing.md,
                        ),
                        _buildNotifSubToggle(
                          context: context,
                          icon: LucideIcons.partyPopper,
                          iconColor: isDark ? const Color(0xFF8B5CF6) : const Color(0xFF5B21B6),
                          title: 'Day-of Celebrations',
                          subtitle:
                              'Morning alerts on the festival day + eve reminder',
                          value: controller.festivalEventNotifs.value,
                          onChanged: controller.toggleFestivalEvents,
                        ),
                        _buildNotifSubToggle(
                          context: context,
                          icon: LucideIcons.hourglass,
                          iconColor: AppColors.accentAdaptive(context),
                          title: 'Countdown Reminders',
                          subtitle: '30 days and 7 days before each festival',
                          value: controller.countdownNotifs.value,
                          onChanged: controller.toggleCountdown,
                        ),
                        _buildNotifSubToggle(
                          context: context,
                          icon: LucideIcons.calendarRange,
                          iconColor: AppColors.info,
                          title: 'Weekly Digest',
                          subtitle: 'Every Sunday — what\'s coming this week',
                          value: controller.weeklyDigestNotifs.value,
                          onChanged: controller.toggleWeeklyDigest,
                        ),
                        _buildNotifSubToggle(
                          context: context,
                          icon: LucideIcons.calendarDays,
                          iconColor: AppColors.successAdaptive(context),
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
}
