import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/models/event_model.dart';
import '../../data/services/ambient_audio_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/smart_lottie.dart';
import 'event_details_controller.dart';
import 'widgets/gratitude_journal.dart';
import 'widgets/history_section.dart';
import 'widgets/ritual_guide.dart';
import 'widgets/mantra_card.dart';
import 'widgets/mark_celebrated_button.dart';
import 'widgets/festival_extras_section.dart';
import 'widgets/social_share_bar.dart';

// Newly extracted widgets
import 'widgets/event_hero_header.dart';
import 'widgets/event_wiki_button.dart';
import 'widgets/event_tldr_summary.dart';
import 'widgets/event_muhurat_card.dart';
import 'widgets/event_tags_list.dart';
import 'widgets/similar_events_scroller.dart';
import 'widgets/event_gallery_grid.dart';

class EventDetailsView extends GetView<EventDetailsController> {
  const EventDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final event = controller.event.value;
      final bool isLoading = controller.isLoading.value;
      final String error = controller.errorMessage.value;

      if (isLoading) {
        return NeoScaffold(
          body: Center(
            child: CircularProgressIndicator(color: AppColors.primaryAdaptive(context)),
          ),
        );
      }

      if (event == null) {
        return NeoScaffold(
          body: Center(
            child: Text(
              error.isNotEmpty ? error : 'Event not found',
              style: AppTextStyles.bodyMedium(context).copyWith(color: Colors.white70),
            ),
          ),
        );
      }

      return NeoScaffold(
        hideNoise: false,
        backgroundColor: AppColors.background(context),
        body: Stack(
          children: [
            // --- FESTIVAL LOTTIE OVERLAY (Dynamic Backdrop) ---
            if (event.lottieOverlay != null &&
                event.lottieOverlay!.filename.isNotEmpty)
              Positioned.fill(
                child: IgnorePointer(
                  child: SmartLottie(
                    url: event.lottieOverlay!.s3Key.isNotEmpty
                        ? event.lottieOverlay!.s3Key
                        : event.lottieOverlay!.filename,
                    fallbackAsset:
                        'assets/lottie/${event.lottieOverlay!.filename}',
                    fit: BoxFit.cover,
                    repeat: true,
                  ).animate().fade(duration: 800.ms),
                ),
              ),

            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // ─────────────────────────────────────────────────────────────────
                // 1. Full-Bleed Parallax Header
                // ─────────────────────────────────────────────────────────────────
                SliverToBoxAdapter(
                  child: EventHeroHeader(
                    event: event,
                    heroTagPrefix: controller.heroTagPrefix.value,
                  ),
                ),

                // ─────────────────────────────────────────────────────────────────
                // 2. Adaptive Content Sheet
                // ─────────────────────────────────────────────────────────────────
                SliverToBoxAdapter(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 24,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Wiki / History Button ─────────────────────────────────────
                        EventWikiButton(event: event),

                        // ── TL;DR Summary ──────────────────────────────────────────────
                        EventTldrSummary(event: event),

                        // ── Auspicious Time (Muhurat) ───────────────────────────────────
                        EventMuhuratCard(event: event),

                        // ── Tags ──────────────────────────────────────────────
                        EventTagsList(event: event),

                        // ── Description ───────────────────────────────────────
                        if (event.description.isNotEmpty)
                          Text(
                            event.description,
                            style: AppTextStyles.bodyLarge(context).copyWith(
                              color: AppColors.textAdaptiveSecondary(context),
                              height: 1.8,
                              fontSize: 16,
                            ),
                          ).animate().fade(delay: 300.ms),

                        // ── Ritual Guide ─────────────────────────────────────────
                        if (event.ritualSteps.isNotEmpty) ...[
                          AppSpacing.verticalXl,
                          RitualGuide(steps: event.ritualSteps),
                        ],

                        // ── Mantra Card ──────────────────────────────────────────
                        if (event.mantras.isNotEmpty) ...[
                          AppSpacing.verticalXl,
                          MantraCard(mantra: event.mantras.first),
                        ],

                        AppSpacing.verticalXl,

                        // ── Mark Celebrated ──────────────────────────────────────
                        const MarkCelebratedButton(),

                        AppSpacing.verticalXl,

                        // ── Gratitude Journal ────────────────────────────────────
                        GratitudeJournal(
                          eventId: event.id,
                          eventTitle: event.title,
                        ).animate().fade().slideY(begin: 0.1),

                        AppSpacing.verticalXl,

                        // ── Recipe/Dress Gate ──────────────────────────────────────────
                        FestivalExtrasSection(event: event),

                        // ── Did You Know? (Facts) ──────────────────────────────
                        if (event.facts.isNotEmpty) ...[
                          AppSpacing.verticalXl,
                          HistorySection(facts: event.facts),
                        ],

                        // ── Visual Journey (Gallery) ───────────────────────────
                        if (event.gallery.isNotEmpty || event.image != null) ...[
                          AppSpacing.verticalXl,
                          EventGalleryGrid(
                            gallery: event.gallery,
                            heroImage: event.image,
                          ),
                        ],

                        AppSpacing.verticalXl,

                        // ── Similar Events Scroller ───────────────────────────
                        SimilarEventsScroller(
                          relatedEvents: controller.relatedEvents,
                        ),

                        // ── Social Share Bar ─────────────────────────────────
                        SocialShareBar(event: event),

                        AppSpacing.verticalXl,

                        // ── Calendar Card ─────────────────────
                        CalendarCard(event: event),

                        const SizedBox(height: 100), // Space for Floating Controller
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        floatingActionButton: _FloatingAudioController(event: event),
      );
    });
  }
}

// ── Floating Zen Audio Controller ────────────────────────────────────────────
class _FloatingAudioController extends StatelessWidget {
  final EventModel event;
  const _FloatingAudioController({required this.event});

  @override
  Widget build(BuildContext context) {
    final audioService = Get.find<AmbientAudioService>();

    return Obx(() {
      final bool isCurrentEvent = audioService.currentEventSlug.value == event.slug;
      final bool isPlaying = audioService.isPlaying.value;

      // Hide if this event has no audio and nothing else is playing either
      if (event.ambientAudio == null && !isCurrentEvent) return const SizedBox.shrink();

      return GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          if (isPlaying && isCurrentEvent) {
            audioService.stop();
          } else {
            audioService.playForEvent(event);
          }
        },
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: isPlaying && isCurrentEvent
                ? AppColors.primaryAdaptive(context).withValues(alpha: 0.15)
                : AppColors.surfaceGlass(context),
            shape: BoxShape.circle,
            border: Border.all(
              color: isPlaying && isCurrentEvent
                  ? AppColors.primaryAdaptive(context).withValues(alpha: 0.4)
                  : AppColors.glassBorder(context),
            ),
            boxShadow: [
              if (isPlaying && isCurrentEvent)
                BoxShadow(
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.3),
                  blurRadius: 15,
                  spreadRadius: 2,
                ),
              ...AppColors.glassShadow(context),
            ],
          ),
          child: Center(
            child: Icon(
              (isPlaying && isCurrentEvent) ? LucideIcons.music : LucideIcons.volumeX,
              color: (isPlaying && isCurrentEvent)
                  ? AppColors.primaryAdaptive(context)
                  : AppColors.textAdaptiveSecondary(context),
              size: 24,
            ),
          ),
        )
            .animate(
              onPlay: (controller) => controller.repeat(reverse: true),
            )
            .scale(
              begin: const Offset(1, 1),
              end: isPlaying && isCurrentEvent ? const Offset(1.1, 1.1) : const Offset(1, 1),
              duration: 1200.ms,
              curve: Curves.easeInOut,
            ),
      ).animate().fade().scale();
    });
  }
}
