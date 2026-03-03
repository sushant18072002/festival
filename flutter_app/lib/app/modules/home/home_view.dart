// Removed unused dart:ui import
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';
// Removed unused data_repository import
import 'home_controller.dart';
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
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
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
                                    top: AppSpacing.md,
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
                                                fallback: Colors.white,
                                              ),
                                        ),
                                        const SizedBox(width: 4),
                                      ],
                                      Text(
                                        happeningNow.category?.name
                                                .toUpperCase() ??
                                            'FESTIVAL',
                                        style: AppTextStyles.labelSmall
                                            .copyWith(
                                              color: AppColors.primary,
                                              letterSpacing: 1.2,
                                            ),
                                      ),
                                    ],
                                  ),
                                ),
                                HeroBanner(event: happeningNow),
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
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.only(top: AppSpacing.md),
                    child: TriviaCard(),
                  ),
                ),

                const SliverToBoxAdapter(child: CompatibilityQuizCard()),

                // 3. Section Title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md,
                      AppSpacing.xl,
                      AppSpacing.md,
                      AppSpacing.sm,
                    ),
                    child: Obx(
                      () => Text(
                        controller.isForYouView.value
                            ? 'for_you'.tr
                            : 'explore_vibes'.tr,
                        style: AppTextStyles.headlineMedium,
                      ),
                    ).animate().fade().slideY(begin: 0.2),
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
                    child: Lottie.asset(
                      'assets/lottie/${activeLottie.filename}',
                      fit: BoxFit.cover,
                      repeat: true,
                      errorBuilder: (context, error, stackTrace) {
                        debugPrint('Lottie Takeover Error: $error');
                        return const SizedBox.shrink();
                      },
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
    return Obx(() {
      final images = controller.filteredImages;
      if (images.isEmpty) return _buildEmptyState();

      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        sliver: SliverMasonryGrid.count(
          crossAxisCount: 2,
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: AppSpacing.sm,
          childCount: images.length,
          itemBuilder: (context, index) {
            // Add staggering effect
            return TrendingImageCard(
              image: images[index],
              index: index,
            ).animate(delay: (50 * index).ms).fade().slideY(begin: 0.2);
          },
        ),
      );
    });
  }

  Widget _buildEmptyState() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          children: [
            Icon(
              Icons.nightlight_round,
              size: 64,
              color: AppColors.textMuted.withValues(alpha: 0.2),
            ),
            AppSpacing.verticalMd,
            Text(
              'no_festivals'.tr,
              style: AppTextStyles.headlineSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
