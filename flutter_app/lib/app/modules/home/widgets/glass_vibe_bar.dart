import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../data/providers/data_repository.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../theme/app_vibes.dart';
import '../home_controller.dart';
import 'vibe_pill.dart';

class GlassVibeBarDelegate extends SliverPersistentHeaderDelegate {
  final HomeController controller;

  GlassVibeBarDelegate({required this.controller});

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final blur = shrinkOffset > 0 ? 10.0 : 0.0;
    final opacity = shrinkOffset > 0 ? 0.85 : 0.0;

    // Theme-aware background when sticky
    final stickyBg = isDark
        ? AppColors.backgroundDark.withValues(alpha: opacity)
        : AppColors.backgroundLight.withValues(alpha: opacity == 0 ? 0 : 0.92);

    // Theme-aware border
    final borderColor = isDark
        ? AppColors.border.withValues(alpha: shrinkOffset > 0 ? 0.4 : 0.0)
        : const Color(
            0x1A1A0B2E,
          ).withValues(alpha: shrinkOffset > 0 ? 0.6 : 0.0);

    // Title text color
    final titleColor = isDark ? Colors.white : const Color(0xFF1A0B2E);

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration: BoxDecoration(
            color: stickyBg,
            border: Border(bottom: BorderSide(color: borderColor)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: "Choose your vibe" + grid/list toggle
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  4,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'choose_your_vibe'.tr,
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                      ),
                    ),
                    Obx(
                      () => IconButton(
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          controller.toggleViewMode();
                        },
                        icon: Icon(
                          controller.isGridView.value
                              ? Icons.view_list_rounded
                              : Icons.grid_view_rounded,
                          color: AppColors.primary,
                          size: 24,
                        ),
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
              ),
              // Vibe pills scroll
              Expanded(
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  itemCount: AppVibes.fromTaxonomy(
                    Get.find<DataRepository>().currentTaxonomy?.vibes ?? [],
                  ).length,
                  itemBuilder: (context, index) {
                    final vibes = AppVibes.fromTaxonomy(
                      Get.find<DataRepository>().currentTaxonomy?.vibes ?? [],
                    );
                    final vibe = vibes[index];
                    return Obx(
                      () => VibePill(
                        label: vibe.label,
                        emoji: vibe.emoji,
                        vibeCode: vibe.code,
                        isDark: isDark,
                        isSelected: controller.selectedVibe.value == vibe.code,
                        onTap: () {
                          HapticFeedback.selectionClick();
                          controller.selectVibe(vibe.code);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  double get maxExtent => 120;
  @override
  double get minExtent => 120;
  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) =>
      true;
}
