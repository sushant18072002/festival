import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../explore_controller.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class ExploreTabs extends StatelessWidget {
  const ExploreTabs({super.key});

  Widget _buildTabButton(String label, int index, ExploreController controller, BuildContext context, bool isDark) {
    return Obx(() {
      final isSelected = controller.currentTab.value == index;
      final primaryAdaptive = AppColors.primaryAdaptive(context);
      
      return GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          controller.currentTab.value = index;
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: isSelected
                ? primaryAdaptive.withValues(alpha: isDark ? 0.2 : 0.1)
                : Colors.transparent,
            border: Border.all(
              color: isSelected ? primaryAdaptive : Colors.transparent,
            ),
          ),
          child: Text(
            label,
            style: AppTextStyles.labelLarge(context).copyWith(
              color: isSelected
                  ? primaryAdaptive
                  : (isDark ? Colors.white54 : Colors.black54),
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            ),
          ),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ExploreController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      physics: const BouncingScrollPhysics(),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTabButton('visuals'.tr, 0, controller, context, isDark),
          const SizedBox(width: 8),
          _buildTabButton('festivals'.tr, 1, controller, context, isDark),
          const SizedBox(width: 8),
          _buildTabButton('wisdom'.tr, 2, controller, context, isDark),
          const SizedBox(width: 8),
          _buildTabButton('play'.tr, 3, controller, context, isDark),
        ],
      ),
    );
  }
}
