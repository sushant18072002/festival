import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';

import '../../../data/models/event_model.dart';
import '../../../data/services/ambient_audio_service.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/smart_image.dart';
import '../../../routes/app_pages.dart';

class EventHeroHeader extends StatelessWidget {
  final EventModel event;
  final String heroTagPrefix;

  const EventHeroHeader({
    super.key,
    required this.event,
    required this.heroTagPrefix,
  });

  Color? _parseColor(String hex) {
    try {
      final cleaned = hex.replaceFirst('#', '');
      if (cleaned.length == 6) return Color(int.parse('FF$cleaned', radix: 16));
      if (cleaned.length == 8) return Color(int.parse(cleaned, radix: 16));
      return null;
    } catch (_) {
      return null;
    }
  }

  String _formatFullDate(DateTime date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final nextOccurrence = event.nextOccurrence;

    return SizedBox(
      height: 460,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // A) Hero Image or Gradient Background
          Container(
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(40),
                bottomRight: Radius.circular(40),
              ),
            ),
            clipBehavior: Clip.hardEdge,
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (event.image != null)
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.mediumImpact();
                      SystemSound.play(SystemSoundType.click);
                      Get.toNamed(
                        Routes.imageDetails,
                        arguments: event.image,
                      );
                    },
                    child: Hero(
                      tag: '${heroTagPrefix}_festival_card_${event.id}',
                      child: SmartImage(
                        event.image!.url,
                        fit: BoxFit.cover,
                        dominantColor: event.image!.dominantColors.isNotEmpty
                            ? _parseColor(event.image!.dominantColors.first)
                            : null,
                      ),
                    ),
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.topCenter,
                        colors: [
                          AppColors.primaryAdaptive(context).withValues(alpha: 0.6),
                          AppColors.background(context),
                        ],
                      ),
                    ),
                  ),
                // Bottom gradient — strong enough to ensure text is ALWAYS readable
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.0),
                        Colors.black.withValues(alpha: 0.15),
                        Colors.black.withValues(alpha: 0.72),
                      ],
                      stops: const [0.0, 0.45, 1.0],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // B) Top Action Bar (Back, Ambient, Share)
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Back Button
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black.withValues(alpha: 0.2),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                    ),
                    child: const Icon(
                      LucideIcons.chevronLeft,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),

                // Ambient Audio Pill
                if (event.ambientAudio != null)
                  Obx(() {
                    final audio = AmbientAudioService.to;
                    final isActive = audio.isActiveFor(event.slug);
                    final loading = audio.isLoading.value && isActive;
                    final playing = audio.isPlaying.value && isActive;

                    return GestureDetector(
                      onTap: () => audio.playForEvent(event),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          color: Colors.black.withValues(alpha: 0.4),
                          border: Border.all(
                            color: playing
                                ? AppColors.primaryAdaptive(context).withValues(alpha: 0.3)
                                : Colors.transparent,
                          ),
                          boxShadow: playing
                              ? [
                                  BoxShadow(
                                    color: AppColors.primaryAdaptive(context)
                                        .withValues(alpha: 0.4),
                                    blurRadius: 15,
                                  ),
                                ]
                              : [],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (loading)
                              SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primaryAdaptive(context),
                                ),
                              )
                            else
                              Icon(
                                playing
                                    ? LucideIcons.audioWaveform
                                    : LucideIcons.music,
                                color: playing
                                    ? AppColors.primaryAdaptive(context)
                                    : Colors.white70,
                                size: 14,
                              ),
                            const SizedBox(width: 6),
                            Text(
                              'AMBIENT',
                              style: AppTextStyles.labelSmall(context).copyWith(
                                color: playing
                                    ? AppColors.primaryAdaptive(context)
                                    : Colors.white70,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).animate().fade().slideX(begin: 0.2),

                // Share Button
                GestureDetector(
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    SharePlus.instance.share(
                      ShareParams(
                        text: 'Check out ${event.title} on Utsav! ✨',
                      ),
                    );
                  },
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black.withValues(alpha: 0.2),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                    ),
                    child: const Icon(
                      LucideIcons.share,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // C) Bottom Text Gradient & Title
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Vibes Pills
                  if (event.vibes.isNotEmpty)
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: event.vibes.take(3).map((vibe) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.1),
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            vibe.name.toUpperCase(),
                            style: AppTextStyles.labelSmall(context).copyWith(
                              color: Colors.white.withValues(alpha: 0.9), // Always white on image
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1.0,
                            ),
                          ),
                        );
                      }).toList(),
                    ).animate().fade().slideY(begin: 0.2),

                  const SizedBox(height: 16),

                  // Title — always with text shadow for light images
                  Text(
                    event.title,
                    style: AppTextStyles.displayLarge(context).copyWith(
                      color: Colors.white,
                      fontSize: 40,
                      height: 1.1,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                      shadows: [
                        const Shadow(
                          color: Colors.black45,
                          offset: Offset(0, 2),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ).animate().fade(delay: 150.ms).slideY(begin: 0.2),

                  const SizedBox(height: 16),

                  // Dates Info
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (event.date != null)
                        Row(
                          children: [
                            const Icon(
                              LucideIcons.calendarDays,
                              color: AppColors.primary,
                              size: 14,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _formatFullDate(event.date!),
                              style: AppTextStyles.bodyMedium(context).copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      if (nextOccurrence != null && event.date != null)
                        const SizedBox(height: 6),
                      if (nextOccurrence != null)
                        Row(
                          children: [
                            Icon(
                              LucideIcons.refreshCw,
                              color: Colors.white.withValues(alpha: 0.6),
                              size: 14,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Next: ${_formatFullDate(nextOccurrence)}',
                              style: AppTextStyles.bodySmall(context).copyWith(
                                color: Colors.white.withValues(alpha: 0.6),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ).animate().fade(delay: 250.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
