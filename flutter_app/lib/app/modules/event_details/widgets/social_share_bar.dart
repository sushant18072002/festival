import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:add_2_calendar/add_2_calendar.dart' as calendar;
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Social Share Bar
// Shows: WhatsApp, Instagram, Copy Link — for sharing the event
// ─────────────────────────────────────────────────────────────────────────────
class SocialShareBar extends StatelessWidget {
  final EventModel event;

  const SocialShareBar({super.key, required this.event});

  String get _shareText =>
      '🎉 ${event.title}${event.date != null ? ' — ${_fmt(event.date!)}' : ''}\n\n'
      '${event.description.isNotEmpty ? event.description.substring(0, event.description.length.clamp(0, 120)).trim() : ''}...\n\n'
      'Explore more on Utsav App 🪔';

  String _fmt(DateTime d) {
    const m = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${m[d.month - 1]} ${d.day}, ${d.year}';
  }

  Future<void> _shareWhatsApp(BuildContext context) async {
    HapticFeedback.mediumImpact();
    final encoded = Uri.encodeComponent(_shareText);
    final wa = Uri.parse('whatsapp://send?text=$encoded');
    if (await canLaunchUrl(wa)) {
      await launchUrl(wa, mode: LaunchMode.externalApplication);
    } else {
      // Fallback to generic share
      await SharePlus.instance.share(ShareParams(text: _shareText));
    }
  }

  Future<void> _shareInstagram(BuildContext context) async {
    HapticFeedback.mediumImpact();
    // Try to open Instagram directly
    final ig = Uri.parse('instagram://app');
    if (await canLaunchUrl(ig)) {
      // Use share_plus to share text (user can copy-paste in IG)
      await SharePlus.instance.share(
        ShareParams(text: _shareText, subject: event.title),
      );
    } else {
      await SharePlus.instance.share(ShareParams(text: _shareText));
    }
  }

  Future<void> _copyLink(BuildContext context) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryAdaptive = AppColors.primaryAdaptive(context);
    HapticFeedback.lightImpact();
    await Clipboard.setData(ClipboardData(text: _shareText));
    
    Get.snackbar(
      '📋 Copied!',
      'Event text copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: primaryAdaptive,
      colorText: isDark ? Colors.black : Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 14,
      duration: const Duration(seconds: 2),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.glassBorder(context)),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.share2,
                  color: AppColors.primaryAdaptive(context),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Share this Festival',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Share Buttons Row
          Row(
            children: [
              // ── WhatsApp ──────────────────────────────────────────────────
              Expanded(
                child: _ShareButton(
                  label: 'WhatsApp',
                  icon: _WhatsAppIcon(),
                  color: const Color(0xFF25D366),
                  isDark: isDark,
                  onTap: () => _shareWhatsApp(context),
                ),
              ),
              const SizedBox(width: 10),

              // ── Instagram ─────────────────────────────────────────────────
              Expanded(
                child: _ShareButton(
                  label: 'Instagram',
                  icon: _InstagramIcon(),
                  color: const Color(0xFFE1306C),
                  isDark: isDark,
                  onTap: () => _shareInstagram(context),
                ),
              ),
              const SizedBox(width: 10),

              // ── Copy Link ─────────────────────────────────────────────────
              Expanded(
                child: _ShareButton(
                  label: 'Copy',
                  icon: Icon(
                    LucideIcons.copy,
                    color: AppColors.primaryAdaptive(context),
                    size: 22,
                  ),
                  color: AppColors.primaryAdaptive(context),
                  isDark: isDark,
                  onTap: () => _copyLink(context),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // More options — generic share sheet
          GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              SharePlus.instance.share(ShareParams(text: _shareText));
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surfaceGlass(context),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.glassBorder(context)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.ellipsis,
                    color: AppColors.textAdaptiveSecondary(context),
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'More options',
                    style: AppTextStyles.labelMedium(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1);
  }
}

class _ShareButton extends StatelessWidget {
  final String label;
  final Widget icon;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _ShareButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: isDark ? 0.12 : 0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            icon,
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar Card — inline, replaces floating action button
// ─────────────────────────────────────────────────────────────────────────────
class CalendarCard extends StatelessWidget {
  final EventModel event;

  const CalendarCard({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    if (event.date == null) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dateStr = _fmt(event.date!);

    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        calendar.Add2Calendar.addEvent2Cal(
          calendar.Event(
            title: event.title,
            description: event.description,
            location: event.location,
            startDate: event.date!,
            endDate: event.date!.add(const Duration(hours: 24)),
            allDay: true,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primaryAdaptive(context).withValues(alpha: isDark ? 0.12 : 0.06),
              AppColors.primaryAdaptive(context).withValues(alpha: isDark ? 0.06 : 0.03),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primaryAdaptive(context).withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            // Calendar Icon Block
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.primaryAdaptive(context),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryAdaptive(context).withValues(
                      alpha: isDark ? 0.5 : 0.2,
                    ),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                LucideIcons.calendarDays,
                color: isDark ? Colors.black : Colors.white,
                size: 28,
              ),
            ),

            const SizedBox(width: 16),

            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SAVE TO CALENDAR',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.primaryAdaptive(context),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    dateStr,
                    style: AppTextStyles.titleMedium(context).copyWith(
                      color: AppColors.textAdaptive(context),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Tap to add to your device calendar',
                    style: AppTextStyles.bodySmall(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
                    ),
                  ),
                ],
              ),
            ),

            // Arrow
            Icon(
              LucideIcons.chevronRight,
              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.7),
              size: 22,
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.08);
  }

  String _fmt(DateTime d) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform icon helpers (we draw them since no icon package for logos)
// ─────────────────────────────────────────────────────────────────────────────
class _WhatsAppIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        color: Color(0xFF25D366),
        shape: BoxShape.circle,
      ),
      child: const Icon(
        LucideIcons.messageSquare,
        color: Colors.white,
        size: 14,
      ),
    );
  }
}

class _InstagramIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFD5949), Color(0xFFD6249F), Color(0xFF285AEB)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Icon(
        LucideIcons.camera,
        color: Colors.white,
        size: 14,
      ),
    );
  }
}
