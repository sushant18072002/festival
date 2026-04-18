// Removed unused dart:ui import
import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
// Removed unused data_repository import
import 'home_controller.dart';
import '../../widgets/smart_lottie.dart';
import '../../data/models/event_model.dart';
import '../../widgets/neo_scaffold.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
// Removed unused app_vibes import
import '../../theme/taxonomy_icon_resolver.dart';
import '../../theme/taxonomy_icon_widget.dart';
// Removed unused routes import
// Removed unused profile_controller import
import '../../widgets/banner_ad_widget.dart';
import 'widgets/hero_banner.dart';
import 'widgets/auto_rotating_carousel.dart';
// Removed unused vibe_pill import
import 'widgets/trending_image_card.dart';
import 'widgets/festival_takeover_overlay.dart';
import '../../widgets/global_error_widget.dart';
import 'widgets/trivia_card.dart';
import 'widgets/compatibility_quiz_card.dart';
import 'widgets/glass_vibe_bar.dart';
import 'widgets/home_top_app_bar.dart';
import 'widgets/home_greeting_titles.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      // App Bar is handled inside CustomScrollView for scroll effects,
      // but we can pass a floating one here if needed.
      // For "Portal" effect, we want it transparent.
      body: Obx(() {
        if (controller.isLoading.value) {
          return Center(
            child: CircularProgressIndicator(color: AppColors.primaryAdaptive(context)),
          );
        }

        if (controller.hasError.value) {
          return GlobalErrorWidget(
            message: 'Could not reach the Utsav servers.',
            onRetry: controller.fetchFeed,
          );
        }

        final feed = controller.homeFeed.value;
        if (feed == null) return const SizedBox.shrink();

        final upcomingSection = feed.sections.firstWhereOrNull(
          (s) => s.code == 'upcoming',
        );
        final upcomingEvents = (upcomingSection?.items.isNotEmpty == true)
            ? upcomingSection!.items.cast<EventModel>().take(3).toList()
            : <EventModel>[];

        final happeningNow = controller.happeningNowEvent.value;
        final activeLottie = happeningNow?.lottieOverlay;

        return Stack(
          children: [
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // 1. Massive Greeting Header (The Portal Entry)
                _buildGreetingHeader(),

                // 2. Happening Now OR Hero Crystal Card (Floating)
                if (happeningNow != null)
                  SliverToBoxAdapter(
                    child:
                        Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(
                                    left: AppSpacing.md,
                                    bottom: AppSpacing.sm,
                                    //top: AppSpacing.md,
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (happeningNow.category != null &&
                                          happeningNow.category!.icon !=
                                              null) ...[
                                        TaxonomyIconWidget(
                                          iconSource:
                                              happeningNow.category!.icon,
                                          size: 14,
                                          color:
                                              TaxonomyIconResolver.resolveColor(
                                                happeningNow.category!.color,
                                                fallback: Theme.of(
                                                  context,
                                                ).colorScheme.onSurface,
                                              ),
                                        ),
                                        const SizedBox(width: 4),
                                      ],
                                      Text(
                                        happeningNow.category?.name
                                                .toUpperCase() ??
                                            'FESTIVAL',
                                        style: AppTextStyles.labelSmall(context)
                                            .copyWith(
                                              color: AppColors.primaryAdaptive(context),
                                              letterSpacing: 1.2,
                                            ),
                                      ),
                                    ],
                                  ),
                                ),
                                HeroBanner(
                                  event: happeningNow,
                                  heroTagPrefix: 'home_happening_now',
                                ),
                              ],
                            )
                            .animate()
                            .fade(duration: 600.ms)
                            .scale(
                              begin: const Offset(0.95, 0.95),
                              curve: Curves.easeOut,
                            ),
                  )
                else if (upcomingEvents.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.md),
                      child: AutoRotatingCarousel(events: upcomingEvents)
                          .animate()
                          .fade(duration: 600.ms)
                          .scale(
                            begin: const Offset(0.95, 0.95),
                            curve: Curves.easeOut,
                          ),
                    ),
                  ),

                // 2.5 Engagement Cards (Trivia & Quiz)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.md),
                    child: Builder(builder: (context) {
                      if (!controller.showEngagementCards.value) {
                        return const SizedBox.shrink();
                      }

                      if (controller.primaryCard.value == 'trivia') {
                        return Column(
                          children: [
                            const _HeroBadge(textKey: 'recommended_for_you'),
                            const TriviaCard(),
                            const SizedBox(height: AppSpacing.sm),
                            CompatibilityQuizCard(isSecondary: true),
                          ],
                        );
                      } else {
                        return Column(
                          children: [
                            const _HeroBadge(textKey: 'recommended_for_you'),
                            const CompatibilityQuizCard(),
                            const SizedBox(height: AppSpacing.sm),
                            TriviaCard(isSecondary: true),
                          ],
                        );
                      }
                    }),
                  ),
                ),

                // Glassmorphism Vibe Bar (Sticky)
                SliverPersistentHeader(
                  pinned: true,
                  delegate: GlassVibeBarDelegate(controller: controller),
                ),

                // 5. Masonry Grid (Rising from bottom)
                _buildTrendingGrid(),

                // 6. Banner Ad
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                    child: Center(child: BannerAdWidget()),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 120)),
              ],
            ),

            // --- FESTIVAL LOTTIE OVERLAY (Background) ---
            if (activeLottie != null && activeLottie.filename.isNotEmpty)
              Positioned.fill(
                child: IgnorePointer(
                  child: Animate(
                    effects: const [
                      FadeEffect(duration: Duration(milliseconds: 1500)),
                    ],
                    child: SmartLottie(
                      url: activeLottie.s3Key.isNotEmpty 
                        ? activeLottie.s3Key 
                        : activeLottie.filename,
                      fallbackAsset: 'assets/lottie/${activeLottie.filename}',
                      fit: BoxFit.cover,
                      repeat: true,
                    ),
                  ),
                ),
              ),

            // --- FESTIVAL TAKEOVER INTERACTIVE OVERLAY ---
            if (controller.showTakeover.value && happeningNow != null)
              Positioned.fill(
                child: FestivalTakeoverOverlay(event: happeningNow),
              ),
          ],
        );
      }),
    );
  }

  Widget _buildGreetingHeader() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          60,
          AppSpacing.md,
          AppSpacing.md,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HomeTopAppBar(controller: controller),
            const SizedBox(height: AppSpacing.sm),
            HomeGreetingTitles(controller: controller),
          ],
        ),
      ),
    );
  }

  Widget _buildTrendingGrid() {
    final images = controller.filteredImages;
    if (images.isEmpty) return _buildEmptyState();

    return SliverPadding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      sliver: controller.isGridView.value
          ? SliverMasonryGrid.count(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.sm,
              crossAxisSpacing: AppSpacing.sm,
              childCount: images.length,
              itemBuilder: (context, index) {
                return TrendingImageCard(
                  image: images[index],
                  index: index,
                  heroTagPrefix: 'home_trending_grid',
                ).animate(delay: (50 * index).ms).fade().slideY(begin: 0.2);
              },
            )
          : SliverList.separated(
              itemCount: images.length,
              separatorBuilder: (context, index) =>
                  const SizedBox(height: AppSpacing.lg),
              itemBuilder: (context, index) {
                return TrendingImageCard(
                  image: images[index],
                  index: index,
                  heroTagPrefix: 'home_trending_list',
                ).animate(delay: (50 * index).ms).fade().slideY(begin: 0.2);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return SliverToBoxAdapter(
      child: Builder(
        builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final emptyIconColor = isDark
              ? Colors.white.withValues(alpha: 0.15)
              : const Color(0xFF1A0B2E).withValues(alpha: 0.12);
          final emptyTextColor = isDark
              ? AppColors.textSecondary
              : const Color(0xFF3D1F5C);
          return Padding(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              children: [
                Icon(LucideIcons.moon, size: 64, color: emptyIconColor),
                AppSpacing.verticalMd,
                Text(
                  'no_festivals'.tr,
                  style: AppTextStyles.headlineSmall(context).copyWith(
                    color: emptyTextColor,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _HeroBadge extends StatelessWidget {
  final String textKey;
  const _HeroBadge({required this.textKey});

  @override
  Widget build(BuildContext context) {
    final adaptiveColor = AppColors.primaryAdaptive(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: adaptiveColor.withValues(alpha: isDark ? 0.15 : 0.10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: adaptiveColor.withValues(alpha: isDark ? 0.3 : 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.sparkles, size: 14, color: adaptiveColor),
          const SizedBox(width: AppSpacing.xs),
          Text(
            textKey.tr,
            style: AppTextStyles.labelSmall(context).copyWith(
              color: adaptiveColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    ).animate().fade().slideY(begin: 0.2, end: 0);
  }
}
