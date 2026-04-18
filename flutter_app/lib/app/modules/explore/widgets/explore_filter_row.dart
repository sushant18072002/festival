import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../explore_controller.dart';
import '../../home/widgets/vibe_pill.dart';
import '../../../theme/taxonomy_icon_resolver.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class ExploreFilterRow extends StatelessWidget {
  const ExploreFilterRow({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ExploreController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                color: AppColors.surfaceGlass(context),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.glassBorder(context)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: controller.sortOption.value,
                  dropdownColor: AppColors.surfaceGlass(context),
                  icon: Icon(
                    LucideIcons.arrowDownUp,
                    color: isDark ? Colors.white70 : AppColors.primaryAdaptive(context),
                    size: 16,
                  ),
                  style: AppTextStyles.labelMedium(context).copyWith(
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
            // Layout Toggle
            Container(
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceGlass(context),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.glassBorder(context)),
              ),
              child: IconButton(
                icon: Icon(
                  controller.isGridView.value
                      ? LucideIcons.layoutGrid
                      : LucideIcons.stretchHorizontal,
                  color: isDark ? Colors.white70 : AppColors.primaryAdaptive(context),
                  size: 20,
                ),
                onPressed: () {
                  HapticFeedback.selectionClick();
                  controller.toggleViewMode();
                },
              ),
            ),
          ],
        );
      }),
    );
  }
}
