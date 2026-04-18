import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'explore_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import '../home/widgets/trending_image_card.dart';
import '../../widgets/banner_ad_widget.dart';
import '../../widgets/global_error_widget.dart';
import '../../data/models/quote_model.dart';
import '../../data/models/mantra_model.dart';
import '../home/widgets/grid_shimmer_loader.dart';
import '../home/widgets/trivia_card.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../routes/app_pages.dart';

import 'widgets/explore_event_card.dart';
import 'widgets/explore_wisdom_card.dart';
import 'widgets/explore_tabs.dart';
import 'widgets/explore_filter_row.dart';
import 'widgets/explore_quiz_card.dart';
import 'widgets/explore_empty_state.dart';

class ExploreView extends GetView<ExploreController> {
  const ExploreView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return NeoScaffold(
      // Transparent App Bar
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        automaticallyImplyLeading: false,
        title: Text(
          'Explore'.tr,
          style: AppTextStyles.headlineMedium(context).copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
        actions: [
          // Surprise Me Button (Phase 15)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              icon: Icon(LucideIcons.sparkles, color: AppColors.accentAdaptive(context)),
              onPressed: () => controller.surpriseMe(),
              tooltip: 'Surprise Me',
            ),
          ),
          // Clear Filter Button (Glass)
          Obx(() {
            final hasFilters =
                controller.selectedCategory.value.isNotEmpty ||
                controller.selectedVibe.value.isNotEmpty ||
                controller.searchQuery.value.isNotEmpty;
            if (!hasFilters) return const SizedBox.shrink();

            return Padding(
              padding: const EdgeInsets.only(right: AppSpacing.md),
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  controller.clearFilters();
                },
                child: GlassContainer(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  color: AppColors.error,
                  opacity: 0.2, // Tinted
                  child: Row(
                    children: [
                      const Icon(LucideIcons.x, size: 14, color: AppColors.error),
                      const SizedBox(width: 4),
                      Text(
                        'CLEAR',
                        style: AppTextStyles.labelSmall(context).copyWith(
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
      body: Column(
        children: [
          // Spacer for AppBar
          SizedBox(height: kToolbarHeight + MediaQuery.of(context).padding.top),

          // 1. Tabs (Explore vs Collections) - Phase 15
          const ExploreTabs(),
          const SizedBox(height: AppSpacing.md),

          // 2. Search Bar (Floating Glass)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                Get.toNamed(Routes.search);
              },
              child: GlassContainer(
                borderRadius: BorderRadius.circular(16),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: 12,
                ),
                color: AppColors.surfaceGlass(context),
                opacity: isDark ? 0.3 : 0.8,
                blur: 10,
                border: Border.all(color: AppColors.glassBorder(context)),
                child: Row(
                  children: [
                    Icon(
                      LucideIcons.search,
                      color: isDark ? Colors.white70 : AppColors.primaryAdaptive(context),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Ask the Oracle...',
                      style: AppTextStyles.bodyMedium(context).copyWith(
                        color: isDark ? Colors.white38 : Colors.black38,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ).animate().fade().slideY(begin: -0.2),
          const SizedBox(height: AppSpacing.sm),

          // 2. Filter Lists & Sort Dropdown
          const ExploreFilterRow(),

          // 3. Masonry Grid / Lists
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const GridShimmerLoader();
              }

              if (controller.hasError.value) {
                return GlobalErrorWidget(
                  message: 'Could not load the gallery right now.',
                  onRetry: controller.fetchData,
                );
              }

              if (controller.currentTab.value == 0 && controller.isGridView.value) {
                if (controller.filteredImages.isEmpty) {
                  return const ExploreEmptyState();
                }
                return MasonryGridView.count(
                  crossAxisCount: 2,
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.sm,
                    AppSpacing.md,
                    120,
                  ),
                  mainAxisSpacing: AppSpacing.md,
                  crossAxisSpacing: AppSpacing.md,
                  itemCount: controller.filteredImages.length,
                  itemBuilder: (context, index) {
                    final item = controller.filteredImages[index];
                    return TrendingImageCard(
                      image: item,
                      index: index,
                      isGrid: true,
                      heroTagPrefix: 'explore_visuals',
                    ).animate().fade(delay: (index * 50).ms).slideY(begin: 0.1);
                  },
                );
              } else if (controller.currentTab.value == 0 && !controller.isGridView.value) {
                if (controller.filteredImages.isEmpty) {
                  return const ExploreEmptyState();
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.sm,
                    AppSpacing.md,
                    120,
                  ),
                  itemCount: controller.filteredImages.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.lg),
                  itemBuilder: (context, index) {
                    final item = controller.filteredImages[index];
                    return TrendingImageCard(
                      image: item,
                      index: index,
                      isGrid: false,
                      heroTagPrefix: 'explore_visuals_list',
                    ).animate().fade().slideY(begin: 0.1);
                  },
                );
              } else if (controller.currentTab.value == 1) {
                if (controller.filteredEvents.isEmpty) {
                  return const ExploreEmptyState();
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.sm,
                    AppSpacing.md,
                    120,
                  ),
                  itemCount: controller.filteredEvents.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, index) {
                    final event = controller.filteredEvents[index];
                    return ExploreEventCard(
                      event: event,
                      heroTagPrefix: 'explore_events',
                    ).animate().fade(delay: (index * 50).ms).slideY(begin: 0.1);
                  },
                );
              } else if (controller.currentTab.value == 3) {
                // ── Play tab: Quizzes & Trivia ──────────────────────────────
                final quizzes = controller.allQuizzes;
                final trivia = controller.allTrivia;
                if (quizzes.isEmpty && trivia.isEmpty) {
                  return const ExploreEmptyState();
                }
                return CustomScrollView(
                  slivers: [
                    // Play Header
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.lg,
                      ),
                      sliver: SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'play'.tr,
                              style: AppTextStyles.headlineLarge(context).copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'play_subtitle'.tr,
                              style: AppTextStyles.bodyMedium(context).copyWith(
                                fontSize: 15,
                                color: AppColors.textAdaptiveSecondary(context),
                              ),
                            ),
                          ],
                        ).animate().fade().slideX(begin: -0.1),
                      ),
                    ),
                    // Quizzes Section
                    if (quizzes.isNotEmpty)
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md, 0, AppSpacing.md, AppSpacing.sm,
                        ),
                        sliver: SliverToBoxAdapter(
                          child: Text(
                            '🎲 ${'quick_quizzes'.tr}',
                            style: AppTextStyles.titleMedium(context).copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    if (quizzes.isNotEmpty)
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              return ExploreQuizCard(quiz: quizzes[index], index: index)
                                  .animate(delay: (index * 50).ms)
                                  .fade()
                                  .slideY(begin: 0.1);
                            },
                            childCount: quizzes.length,
                          ),
                        ),
                      ),
                    // Trivia Section
                    if (trivia.isNotEmpty)
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md, AppSpacing.xl, AppSpacing.md, AppSpacing.sm,
                        ),
                        sliver: SliverToBoxAdapter(
                          child: Text(
                            '🧠 ${'quick_trivia'.tr}',
                            style: AppTextStyles.titleMedium(context).copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    if (trivia.isNotEmpty)
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md, AppSpacing.sm, AppSpacing.md, 120,
                        ),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final t = trivia[index];
                              return TriviaCard(trivia: t)
                                  .animate(delay: (index * 60).ms)
                                  .fade()
                                  .slideX(begin: 0.1);
                            },
                            childCount: trivia.length,
                          ),
                        ),
                      ),
                  ],
                );
              } else {
                // Wisdom (Quotes & Mantras)
                final items = [
                  ...controller.filteredQuotes,
                  ...controller.filteredMantras,
                ];
                if (items.isEmpty) return const ExploreEmptyState();

                return CustomScrollView(
                  slivers: [
                    // Daily Wisdom Header
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        AppSpacing.sm,
                        AppSpacing.md,
                        AppSpacing.lg,
                      ),
                      sliver: SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'daily_wisdom'.tr,
                              style: AppTextStyles.headlineLarge(context).copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'daily_wisdom_subtitle'.tr,
                              style: AppTextStyles.bodyMedium(context).copyWith(
                                fontSize: 15,
                                color: AppColors.textAdaptiveSecondary(context),
                              ),
                            ),
                          ],
                        ).animate().fade().slideX(begin: -0.1),
                      ),
                    ),
                    // Featured Quote
                    SliverPadding(
                      padding: const EdgeInsets.only(
                        left: AppSpacing.md,
                        right: AppSpacing.md,
                        bottom: AppSpacing.lg,
                      ),
                      sliver: SliverToBoxAdapter(
                        child: Builder(
                          builder: (context) {
                            final item = items.first;
                            String text = '';
                            String author = '';
                            String language = 'en';
                            if (item is QuoteModel) {
                              text = item.text;
                              author = item.author.isNotEmpty
                                  ? item.author
                                  : 'Anonymous';
                              language = item.language;
                            } else if (item is MantraModel) {
                              text = item.text;
                              author = item.meaning;
                              language = item.language;
                            }
                            return ExploreWisdomCard(
                              text: text,
                              author: author,
                              language: language,
                              isMantra: item is MantraModel,
                              isFeatured: true,
                              onTap: () {
                                Get.toNamed(
                                  item is MantraModel
                                      ? Routes.mantraDetails
                                      : Routes.quoteDetails,
                                  arguments: item,
                                );
                              },
                            ).animate().fade(delay: 100.ms).slideY(begin: 0.1);
                          },
                        ),
                      ),
                    ),
                    // Wisdom Masonry Grid
                    if (items.length > 1)
                      SliverMasonryGrid.count(
                        crossAxisCount: 2,
                        mainAxisSpacing: AppSpacing.md,
                        crossAxisSpacing: AppSpacing.md,
                        childCount: items.length - 1,
                        itemBuilder: (context, index) {
                          final actualIndex = index + 1;
                          final item = items[actualIndex];
                          String text = '';
                          String author = '';
                          String language = 'en';
                          if (item is QuoteModel) {
                            text = item.text;
                            author = item.author.isNotEmpty
                                ? item.author
                                : 'Anonymous';
                            language = item.language;
                          } else if (item is MantraModel) {
                            text = item.text;
                            author = item.meaning;
                            language = item.language;
                          }

                          return ExploreWisdomCard(
                                text: text,
                                author: author,
                                language: language,
                                isMantra: item is MantraModel,
                                isFeatured: false,
                                onTap: () {
                                  Get.toNamed(
                                    item is MantraModel
                                        ? Routes.mantraDetails
                                        : Routes.quoteDetails,
                                    arguments: item,
                                  );
                                },
                              )
                              .animate()
                              .fade(delay: (actualIndex * 50).ms)
                              .slideY(begin: 0.1);
                        },
                      ),
                  ],
                );
              }
            }),
          ),

          // 4. Banner Ad at the bottom
          const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
            child: Center(child: BannerAdWidget()),
          ),
        ],
      ),
    );
  }
}
