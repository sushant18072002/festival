import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'gallery_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import '../home/widgets/trending_image_card.dart';
import '../../widgets/banner_ad_widget.dart';
import '../../widgets/void_empty_state.dart';
import '../../widgets/global_error_widget.dart';
import 'widgets/collections_grid.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';

import '../../routes/app_pages.dart';

class GalleryView extends GetView<GalleryController> {
  const GalleryView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      // Transparent App Bar
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        automaticallyImplyLeading: false,
        title: Text('Explore The Vibe', style: AppTextStyles.headlineMedium),
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
          _buildTabs(),
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
                  color: AppColors.surfaceGlass,
                  opacity: 0.3,
                  blur: 10,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.1),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded, color: Colors.white70),
                      const SizedBox(width: 12),
                      Text(
                        'Ask the Oracle...',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: Colors.white38,
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
          _buildFilterAndSortRow(),

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

              if (controller.currentTab.value == 1) {
                return const CollectionsGrid();
              }

              if (controller.filteredImages.isEmpty) {
                return _buildEmptyState();
              }

              return MasonryGridView.count(
                crossAxisCount: 2,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  120, // Keep bottom padding for scroll space
                ),
                mainAxisSpacing: AppSpacing.md,
                crossAxisSpacing: AppSpacing.md,
                itemCount: controller.filteredImages.length,
                itemBuilder: (context, index) {
                  final item = controller.filteredImages[index];

                  // Render Image Card (Phase 15)
                  return TrendingImageCard(
                    image: item,
                    index: index,
                  ).animate().fade(delay: (index * 50).ms).slideY(begin: 0.1);
                },
              );
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

  Widget _buildTabs() {
    return Obx(
      () => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTabButton('Images', 0),
          const SizedBox(width: 16),
          _buildTabButton('Collections', 1),
        ],
      ),
    );
  }

  Widget _buildTabButton(String label, int index) {
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
              ? AppColors.primary.withValues(alpha: 0.2)
              : Colors.transparent,
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelLarge.copyWith(
            color: isSelected ? AppColors.primary : Colors.white54,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required ValueChanged<bool> onSelected,
    bool isVibe = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          onSelected(!isSelected);
          controller.filterItems(); // Trigger filter on selection
        },
        child: AnimatedContainer(
          duration: 200.ms,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? (isVibe ? AppColors.secondary : AppColors.primary)
                : AppColors.surfaceGlass,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? Colors.transparent
                  : Colors.white.withValues(alpha: 0.1),
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: (isVibe ? AppColors.secondary : AppColors.primary)
                          .withValues(alpha: 0.4),
                      blurRadius: 10,
                    ),
                  ]
                : [],
          ),
          child: Text(
            label,
            style: AppTextStyles.labelMedium.copyWith(
              color: isSelected ? Colors.black : Colors.white70,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            ),
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

  Widget _buildFilterAndSortRow() {
    return SizedBox(
      height: 50,
      child: Obx(() {
        final tax = controller.taxonomy.value;
        if (tax == null) return const SizedBox.shrink();

        return ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          children: [
            // Categories
            ...tax.categories.map(
              (cat) => _buildFilterChip(
                label: cat.name,
                isSelected: controller.selectedCategory.value == cat.code,
                onSelected: (selected) => controller.selectedCategory.value =
                    selected ? cat.code : '',
              ),
            ),
            // Vertical Divider
            Container(
              width: 1,
              height: 20,
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
              color: Colors.white24,
            ),
            // Vibes
            ...tax.vibes.map(
              (vibe) => _buildFilterChip(
                label: vibe.name,
                isSelected: controller.selectedVibe.value == vibe.code,
                isVibe: true,
                onSelected: (selected) =>
                    controller.selectedVibe.value = selected ? vibe.code : '',
              ),
            ),
            // Sort Dropdown (Phase 15)
            Container(
              margin: const EdgeInsets.only(left: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.surfaceGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: controller.sortOption.value,
                  dropdownColor: AppColors.surfaceGlass,
                  icon: const Icon(
                    Icons.sort_rounded,
                    color: Colors.white70,
                    size: 16,
                  ),
                  style: AppTextStyles.labelMedium,
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
