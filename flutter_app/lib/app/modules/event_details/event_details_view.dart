import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../data/services/ambient_audio_service.dart';
import 'package:add_2_calendar/add_2_calendar.dart' as calendar;
import '../../data/models/event_model.dart';
import '../../data/models/image_model.dart';
import '../../data/models/taxonomy_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../theme/taxonomy_icon_resolver.dart';
import '../../theme/taxonomy_icon_widget.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/smart_image.dart';
import '../../widgets/glass_container.dart';
import '../../routes/app_pages.dart';
import 'event_details_controller.dart';
import 'widgets/gratitude_journal.dart';
import 'widgets/history_section.dart';
import 'widgets/ritual_guide.dart';
import 'widgets/mantra_card.dart';
import 'widgets/mark_celebrated_button.dart';
import 'widgets/festival_extras_section.dart';

class EventDetailsView extends GetView<EventDetailsController> {
  const EventDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final event = controller.event.value;
      final bool isLoading = controller.isLoading.value;
      final String error = controller.errorMessage.value;

      if (isLoading) {
        return const NeoScaffold(
          body: Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
        );
      }

      if (event == null) {
        return NeoScaffold(
          body: Center(
            child: Text(
              error.isNotEmpty ? error : 'Event not found',
              style: AppTextStyles.bodyMedium.copyWith(color: Colors.white70),
            ),
          ),
        );
      }

      final nextOccurrence = event.nextOccurrence;

      return NeoScaffold(
        hideNoise: false,
        body: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ─────────────────────────────────────────────────────────────────
            // 1. Cinematic Parallax Header — "The Cinematic Dive"
            // ─────────────────────────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 420,
              pinned: true,
              stretch: true,
              backgroundColor: Colors.transparent,
              leading: Padding(
                padding: const EdgeInsets.all(8.0),
                child: GlassContainer(
                  borderRadius: BorderRadius.circular(50),
                  padding: EdgeInsets.zero,
                  opacity: 0.3,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Get.back(),
                  ),
                ),
              ),
              actions: [
                // Ambient Audio Pill — now driven by local assets
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Obx(() {
                    final audio = AmbientAudioService.to;
                    final isActive = audio.isActiveFor(event.slug);
                    final loading = audio.isLoading.value && isActive;
                    final playing = audio.isPlaying.value && isActive;

                    return GestureDetector(
                      onTap: () => audio.playForEvent(event),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(50),
                          color: playing
                              ? AppColors.primary.withValues(alpha: 0.35)
                              : Colors.white.withValues(alpha: 0.12),
                          border: Border.all(
                            color: playing
                                ? AppColors.primary.withValues(alpha: 0.7)
                                : Colors.white.withValues(alpha: 0.2),
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 0,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (loading)
                              const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(
                                    Colors.white70,
                                  ),
                                ),
                              )
                            else
                              Icon(
                                playing
                                    ? Icons.stop_rounded
                                    : Icons.music_note_rounded,
                                color: playing
                                    ? AppColors.primary
                                    : Colors.white,
                                size: 18,
                              ),
                            const SizedBox(width: 6),
                            Text(
                              playing ? 'Stop' : 'Ambient',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: playing
                                    ? AppColors.primary
                                    : Colors.white,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ).animate().fade().slideX(begin: 0.2),

                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: GlassContainer(
                    borderRadius: BorderRadius.circular(50),
                    padding: EdgeInsets.zero,
                    opacity: 0.3,
                    child: IconButton(
                      icon: const Icon(Icons.share, color: Colors.white),
                      onPressed: () {
                        HapticFeedback.mediumImpact();
                        SharePlus.instance.share(
                          ShareParams(
                            text: 'Check out ${event.title} on Utsav! ✨',
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                stretchModes: const [
                  StretchMode.zoomBackground,
                  StretchMode.blurBackground,
                ],
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Hero Image
                    if (event.image != null)
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.mediumImpact();
                          SystemSound.play(SystemSoundType.click);
                          Get.toNamed(
                            Routes.IMAGE_DETAILS,
                            arguments: event.image,
                          );
                        },
                        child: Hero(
                          tag: 'image_hero_${event.image!.id}',
                          child: SmartImage(
                            event.image!.url,
                            fit: BoxFit.cover,
                          ),
                        ),
                      )
                    else
                      Container(
                        decoration: BoxDecoration(
                          gradient: RadialGradient(
                            center: Alignment.topCenter,
                            colors: [
                              AppColors.primary.withValues(alpha: 0.6),
                              AppColors.backgroundDark,
                            ],
                          ),
                        ),
                      ),

                    // Deep gradient overlay — blends into content sheet below
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.1),
                            Colors.transparent,
                            AppColors.backgroundDark.withValues(alpha: 0.6),
                            AppColors.backgroundDark,
                          ],
                          stops: const [0.0, 0.35, 0.75, 1.0],
                        ),
                      ),
                    ),

                    // Magazine-style title overlay
                    Positioned(
                      bottom: 20,
                      left: 20,
                      right: 20,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category chip
                          if (event.category != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: TaxonomyIconResolver.resolveColor(
                                  event.category!.color,
                                  fallback: AppColors.accent,
                                ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (event.category!.icon != null) ...[
                                    TaxonomyIconWidget(
                                      iconSource: event.category!.icon,
                                      size: 14,
                                      color: Colors.black87,
                                      fallbackIcon: Icons.label_outline,
                                    ),
                                    const SizedBox(width: 4),
                                  ],
                                  Text(
                                    event.category!.name.toUpperCase(),
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: Colors.black,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                ],
                              ),
                            ).animate().fade().slideX(begin: -0.2),

                          const SizedBox(height: 10),

                          // Event title
                          Text(
                            event.title,
                            style: AppTextStyles.displayLarge.copyWith(
                              color: Colors.white,
                              fontSize: 44,
                              height: 1.0,
                              fontWeight: FontWeight.w900,
                            ),
                          ).animate().fade(delay: 150.ms).slideY(begin: 0.2),

                          const SizedBox(height: 8),

                          // Date + Next Occurrence row
                          Row(
                            children: [
                              if (event.date != null) ...[
                                const Icon(
                                  Icons.calendar_today_outlined,
                                  color: Colors.white60,
                                  size: 14,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  _formatFullDate(event.date!),
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: Colors.white60,
                                  ),
                                ),
                              ],
                              if (nextOccurrence != null &&
                                  event.date != null) ...[
                                const SizedBox(width: 12),
                                const Text(
                                  '•',
                                  style: TextStyle(color: Colors.white38),
                                ),
                                const SizedBox(width: 12),
                              ],
                              if (nextOccurrence != null) ...[
                                const Icon(
                                  Icons.upcoming_outlined,
                                  color: AppColors.accent,
                                  size: 14,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  'Next: ${_formatFullDate(nextOccurrence)}',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.accent,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ],
                          ).animate().fade(delay: 250.ms),

                          const SizedBox(height: 10),

                          // Vibes chips — Bioluminescent neon pills
                          if (event.vibes.isNotEmpty)
                            _VibesRow(
                              vibes: event.vibes,
                            ).animate().fade(delay: 350.ms).slideY(begin: 0.3),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ─────────────────────────────────────────────────────────────────
            // 2. Frosted Glass Content Sheet
            // ─────────────────────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Action Bar (Wiki / Share) ──────────────────────────
                    _buildActionBar(event),

                    // ── TL;DR Summary ──────────────────────────────────────────────
                    if (event.description.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceGlass,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.3),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.05),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('✨', style: TextStyle(fontSize: 20)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'TL;DR',
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _generateTLDR(event.description),
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: Colors.white,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ).animate().fade(delay: 200.ms).slideX(begin: -0.1),

                    // ── Auspicious Time (Muhurat) ───────────────────────────────────
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.accent.withValues(alpha: 0.2),
                            AppColors.accent.withValues(alpha: 0.05),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.accent.withValues(alpha: 0.5),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.access_time_filled_rounded,
                              color: AppColors.accent,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Auspicious Time (Muhurat)',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.accent,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  event.muhurat?.pujaTime.isNotEmpty == true
                                      ? event.muhurat!.pujaTime
                                      : 'Check local timings',
                                  style: AppTextStyles.titleMedium.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).animate().fade(delay: 300.ms).slideY(begin: 0.1),

                    // ── Tags ──────────────────────────────────────────────
                    if (event.tags.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: event.tags.map((tag) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.white24),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '#${tag.name.toLowerCase().replaceAll(' ', '')}',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: Colors.white54,
                                ),
                              ),
                            );
                          }).toList(),
                        ).animate().fade(delay: 200.ms),
                      ),

                    // ── Description ───────────────────────────────────────
                    if (event.description.isNotEmpty)
                      Text(
                        event.description,
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: Colors.white70,
                          height: 1.7,
                          fontSize: 17,
                        ),
                      ).animate().fade(delay: 300.ms),

                    AppSpacing.verticalXl,

                    // ── Ritual Guide ─────────────────────────────────────────
                    if (controller.event.value != null &&
                        controller.event.value!.ritualSteps.isNotEmpty)
                      RitualGuide(steps: controller.event.value!.ritualSteps),

                    AppSpacing.verticalXl,

                    // ── Mantra Card ──────────────────────────────────────────
                    if (event.mantras.isNotEmpty)
                      MantraCard(mantra: event.mantras.first),

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

                    // ── Festival Extras ──────────────────────────────────────
                    FestivalExtrasSection(event: event),

                    AppSpacing.verticalXl,

                    // ── Did You Know? (Facts) ──────────────────────────────
                    if (event.facts.isNotEmpty)
                      HistorySection(facts: event.facts),

                    if (event.facts.isNotEmpty) AppSpacing.verticalXl,

                    // ── Visual Journey (Gallery) ───────────────────────────
                    if (event.gallery.isNotEmpty) ...[
                      Row(
                        children: [
                          Text(
                            'Visual Journey',
                            style: AppTextStyles.headlineMedium.copyWith(
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.4),
                              ),
                            ),
                            child: Text(
                              '${event.gallery.length}',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      SizedBox(
                        height: 200,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: event.gallery.length,
                          itemBuilder: (context, index) {
                            return _GalleryCard(
                              image: event.gallery[index],
                              index: index,
                            );
                          },
                        ),
                      ),
                    ],

                    // ── Similar Events Scroller ───────────────────────────
                    Obx(() {
                      if (controller.relatedEvents.isEmpty) {
                        return const SizedBox.shrink();
                      }
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AppSpacing.verticalXl,
                          Row(
                            children: [
                              const Icon(
                                Icons.explore_outlined,
                                color: Colors.white70,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'You Might Also Like',
                                style: AppTextStyles.headlineMedium.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            height: 220,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: controller.relatedEvents.length,
                              itemBuilder: (context, index) {
                                final related = controller.relatedEvents[index];
                                return GestureDetector(
                                  onTap: () {
                                    HapticFeedback.lightImpact();
                                    // Replace current route with the new event
                                    Get.offNamed(
                                      Routes.EVENT_DETAILS,
                                      arguments: related,
                                      preventDuplicates: false,
                                    );
                                  },
                                  child:
                                      Container(
                                            width: 160,
                                            margin: const EdgeInsets.only(
                                              right: 16,
                                            ),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                              color: AppColors.surfaceDark,
                                            ),
                                            clipBehavior: Clip.antiAlias,
                                            child: Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                if (related.image != null)
                                                  SmartImage(
                                                    related
                                                            .image!
                                                            .thumbnail
                                                            .isNotEmpty
                                                        ? related
                                                              .image!
                                                              .thumbnail
                                                        : related.image!.url,
                                                    fit: BoxFit.cover,
                                                  ),
                                                Positioned.fill(
                                                  child: Container(
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        begin:
                                                            Alignment.topCenter,
                                                        end: Alignment
                                                            .bottomCenter,
                                                        colors: [
                                                          Colors.transparent,
                                                          Colors.black
                                                              .withValues(
                                                                alpha: 0.8,
                                                              ),
                                                        ],
                                                        stops: const [0.4, 1.0],
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Positioned(
                                                  bottom: 12,
                                                  left: 12,
                                                  right: 12,
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      if (related.category !=
                                                          null)
                                                        Text(
                                                          related.category!.name
                                                              .toUpperCase(),
                                                          style: AppTextStyles
                                                              .labelSmall
                                                              .copyWith(
                                                                color: AppColors
                                                                    .accent,
                                                                fontSize: 10,
                                                              ),
                                                        ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        related.title,
                                                        style: AppTextStyles
                                                            .titleMedium
                                                            .copyWith(
                                                              color:
                                                                  Colors.white,
                                                              fontSize: 14,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                            ),
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          )
                                          .animate(
                                            delay: (400 + index * 100).ms,
                                          )
                                          .fade()
                                          .slideY(begin: 0.2),
                                );
                              },
                            ),
                          ),
                        ],
                      );
                    }),

                    const SizedBox(height: 100), // FAB clearance
                  ],
                ),
              ),
            ),
          ],
        ),

        // ── Floating Action Button — "Neon FAB" ────────────────────────────
        floatingActionButton: event.date != null
            ? FloatingActionButton.extended(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                elevation: 0,
                icon: const Icon(Icons.calendar_month),
                label: const Text(
                  'ADD TO CALENDAR',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
                onPressed: () {
                  HapticFeedback.heavyImpact();
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
              ).animate().scale(delay: 600.ms, curve: Curves.elasticOut)
            : null,
      );
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Action Bar: Read History (wiki) + share
  // ─────────────────────────────────────────────────────────────────────────

  Widget _buildActionBar(EventModel event) {
    final hasWiki = event.wikiLink != null && event.wikiLink!.trim().isNotEmpty;

    if (!hasWiki) return const SizedBox.shrink();

    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.white30),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.menu_book_outlined, size: 18),
            label: const Text(
              'READ HISTORY',
              style: TextStyle(letterSpacing: 0.8, fontWeight: FontWeight.w600),
            ),
            onPressed: () {
              HapticFeedback.selectionClick();
              launchUrl(
                Uri.parse(event.wikiLink!),
                mode: LaunchMode.externalApplication,
              );
            },
          ),
        ),
      ],
    ).animate().fade(delay: 100.ms).slideY(begin: 0.2);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────
  String _generateTLDR(String text) {
    if (text.isEmpty) return '';
    final sentences = text.split('.');
    if (sentences.isEmpty) return text;
    return '${sentences.first.trim()}.';
  }

  String _formatFullDate(DateTime date) {
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
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vibes Row — Bioluminescent neon pills
// ─────────────────────────────────────────────────────────────────────────────
class _VibesRow extends StatelessWidget {
  final List<TaxonomyItem> vibes;
  const _VibesRow({required this.vibes});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 6,
      children: vibes.map((vibe) {
        Color glowColor = TaxonomyIconResolver.resolveColor(
          vibe.color,
          fallback: AppColors.primary,
        );

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: glowColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: glowColor.withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(
                color: glowColor.withValues(alpha: 0.25),
                blurRadius: 8,
                spreadRadius: 1,
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: glowColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                vibe.name,
                style: AppTextStyles.labelSmall.copyWith(
                  color: glowColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Card — with caption overlay on tap
// ─────────────────────────────────────────────────────────────────────────────
class _GalleryCard extends StatefulWidget {
  final ImageModel image;
  final int index;
  const _GalleryCard({required this.image, required this.index});

  @override
  State<_GalleryCard> createState() => _GalleryCardState();
}

class _GalleryCardState extends State<_GalleryCard> {
  bool _showCaption = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child:
          GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  Get.toNamed(Routes.IMAGE_DETAILS, arguments: widget.image);
                },
                onLongPress: () {
                  HapticFeedback.heavyImpact();
                  setState(() => _showCaption = !_showCaption);
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: AspectRatio(
                    aspectRatio: 4 / 3,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Image
                        Hero(
                          tag: 'image_hero_${widget.image.id}',
                          child: SmartImage(
                            widget.image.thumbnail,
                            fit: BoxFit.cover,
                          ),
                        ),

                        // Caption overlay (on tap)
                        AnimatedOpacity(
                          opacity: _showCaption ? 1.0 : 0.0,
                          duration: const Duration(milliseconds: 200),
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withValues(alpha: 0.8),
                                ],
                              ),
                            ),
                            alignment: Alignment.bottomLeft,
                            padding: const EdgeInsets.all(10),
                            child: Text(
                              widget.image.displayLabel,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: Colors.white,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
              .animate(delay: (widget.index * 80).ms)
              .fade()
              .scale(begin: Offset(0.92, 0.92)),
    );
  }
}
