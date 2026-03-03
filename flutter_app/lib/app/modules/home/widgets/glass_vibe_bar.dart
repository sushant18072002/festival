import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../data/models/taxonomy_model.dart';
import '../../../data/providers/data_repository.dart';
import '../../../theme/app_colors.dart';
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
    // Glassmorphism calculation
    final blur = shrinkOffset > 0 ? 10.0 : 0.0;
    final opacity = shrinkOffset > 0 ? 0.8 : 0.0;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.backgroundDark.withValues(alpha: opacity),
            border: Border(
              bottom: BorderSide(
                color: AppColors.border.withValues(
                  alpha: shrinkOffset > 0 ? 0.5 : 0.0,
                ),
              ),
            ),
          ),
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: AppVibes.all.length,
            itemBuilder: (context, index) {
              // Populate taxonomy vibes from DB json, falling back to static list if not loaded
              final allVibes = AppVibes.fromTaxonomy(
                Get.find<DataRepository>().currentTaxonomy?.vibes ?? [],
              );
              final filteredVibes = [
                allVibes.first,
                ...allVibes.skip(1).toList()..shuffle(),
              ];
              final vibe = filteredVibes[index];
              return Obx(
                () => VibePill(
                  label: vibe.label,
                  emoji: vibe.emoji,
                  vibeCode: vibe.code,
                  isSelected: controller.selectedVibe.value == vibe.code,
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    controller.selectVibe(vibe.code);
                  },
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  @override
  double get maxExtent => 60;
  @override
  double get minExtent => 60;
  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) =>
      false;
}
