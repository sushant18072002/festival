import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'explore_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import '../home/widgets/trending_image_card.dart';
import '../../widgets/banner_ad_widget.dart';
import '../../widgets/void_empty_state.dart';
import '../../widgets/global_error_widget.dart';
import '../../data/models/quote_model.dart';
import '../../data/models/mantra_model.dart';
import 'widgets/explore_event_card.dart';
import 'widgets/explore_wisdom_card.dart';
import '../home/widgets/vibe_pill.dart';
import '../../theme/taxonomy_icon_resolver.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';

import '../../routes/app_pages.dart';

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
          style: AppTextStyles.headlineMedium.copyWith(
            color: isDark ? Colors.white : const Color(0xFF1A0B2E),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
        actions: [
          // Surprise Me Button (Phase 15)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              icon: const Icon(Icons.auto_awesome, color: AppColors.accent),
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
                      const Icon(Icons.close, size: 14, color: AppColors.error),
                      const SizedBox(width: 4),
                      Text(
                        'CLEAR',
                        style: AppTextStyles.labelSmall.copyWith(
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
          _buildTabs(context, isDark),
          const SizedBox(height: AppSpacing.md),

          // 2. Search Bar (Floating Glass)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Hero(
              tag: 'search_bar_hero',
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  Get.toNamed(Routes.SEARCH);
                },
                child: GlassContainer(
                  borderRadius: BorderRadius.circular(16),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: 12,
                  ),
                  color: isDark ? AppColors.surfaceGlass : Colors.white,
                  opacity: isDark ? 0.3 : 0.8,
                  blur: 10,
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.1)
                        : AppColors.primary.withValues(alpha: 0.1),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.search_rounded,
                        color: isDark ? Colors.white70 : AppColors.primary,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Ask the Oracle...',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: isDark ? Colors.white38 : Colors.black38,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ).animate().fade().slideY(begin: -0.2),
          const SizedBox(height: AppSpacing.sm),

          // 2. Filter Lists & Sort Dropdown
          _buildFilterAndSortRow(context, isDark),

          // 3. Masonry Grid
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                );
              }

              if (controller.hasError.value) {
                return GlobalErrorWidget(
                  message: 'Could not load the gallery right now.',
                  onRetry: controller.fetchData,
                );
              }

              if (controller.currentTab.value == 0) {
                if (controller.filteredImages.isEmpty) {
                  return _buildEmptyState();
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
                    ).animate().fade(delay: (index * 50).ms).slideY(begin: 0.1);
                  },
                );
              } else if (controller.currentTab.value == 1) {
                if (controller.filteredEvents.isEmpty) {
                  return _buildEmptyState();
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
                    ).animate().fade(delay: (index * 50).ms).slideY(begin: 0.1);
                  },
                );
              } else {
                // Wisdom (Quotes & Mantras)
                final items = [
                  ...controller.filteredQuotes,
                  ...controller.filteredMantras,
                ];
                if (items.isEmpty) return _buildEmptyState();

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
                              'Daily Wisdom',
                              style: AppTextStyles.headlineLarge.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Discover timeless quotes and sayings from diverse cultures around the world.',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontSize: 15,
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

  Widget _buildTabs(BuildContext context, bool isDark) {
    return Obx(
      () => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTabButton('Visuals', 0, isDark),
          const SizedBox(width: 12),
          _buildTabButton('Festivals', 1, isDark),
          const SizedBox(width: 12),
          _buildTabButton('Wisdom', 2, isDark),
        ],
      ),
    );
  }

  Widget _buildTabButton(String label, int index, bool isDark) {
    final isSelected = controller.currentTab.value == index;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        controller.currentTab.value = index;
      },
      child: AnimatedContainer(
        duration: 200.ms,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: isSelected
              ? AppColors.primary.withValues(alpha: isDark ? 0.2 : 0.1)
              : Colors.transparent,
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelLarge.copyWith(
            color: isSelected
                ? AppColors.primary
                : (isDark ? Colors.white54 : Colors.black54),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return const VoidEmptyState(
      message: "The void yielded nothing",
      subMessage: "Try searching for 'Light' or 'Music'",
    );
  }

  Widget _buildFilterAndSortRow(BuildContext context, bool isDark) {
    return SizedBox(
      height: 50,
      child: Obx(() {
        final tax = controller.taxonomy.value;
        if (tax == null) return const SizedBox.shrink();

        return ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          children: [
            // 'All' Categories
            VibePill(
              label: 'All'.tr,
              vibeCode: 'all',
              emoji: '🌟',
              isDark: isDark,
              isSelected: controller.selectedCategory.value.isEmpty,
              onTap: () {
                HapticFeedback.selectionClick();
                controller.selectedCategory.value = '';
                controller.filterItems();
              },
            ),
            // Categories
            ...tax.categories.map(
              (cat) => VibePill(
                label: cat.name,
                vibeCode: cat.code,
                iconData: TaxonomyIconResolver.resolve(cat.icon),
                isDark: isDark,
                isSelected: controller.selectedCategory.value == cat.code,
                onTap: () {
                  HapticFeedback.selectionClick();
                  controller.selectedCategory.value =
                      controller.selectedCategory.value == cat.code
                      ? ''
                      : cat.code;
                  controller.filterItems();
                },
              ),
            ),
            // Sort Dropdown (Phase 15)
            Container(
              margin: const EdgeInsets.only(left: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceGlass : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.1)
                      : const Color(0x1A1A0B2E),
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: controller.sortOption.value,
                  dropdownColor: isDark ? AppColors.surfaceGlass : Colors.white,
                  icon: Icon(
                    Icons.sort_rounded,
                    color: isDark ? Colors.white70 : AppColors.primary,
                    size: 16,
                  ),
                  style: AppTextStyles.labelMedium.copyWith(
                    color: isDark ? Colors.white : const Color(0xFF1A0B2E),
                  ),
                  onChanged: (String? newValue) {
                    if (newValue != null) {
                      HapticFeedback.selectionClick();
                      controller.sortOption.value = newValue;
                      controller.filterItems();
                    }
                  },
                  items: const [
                    DropdownMenuItem(value: 'newest', child: Text('Newest')),
                    DropdownMenuItem(value: 'popular', child: Text('Popular')),
                    DropdownMenuItem(value: 'liked', child: Text('Most Liked')),
                    DropdownMenuItem(
                      value: 'shared',
                      child: Text('Most Shared'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    ).animate().fade().slideX(begin: 0.1);
  }
}
