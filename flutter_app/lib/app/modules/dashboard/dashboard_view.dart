import 'dart:ui';
import 'package:flutter/material.dart' hide SearchController;
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../home/home_view.dart';
import '../calendar/calendar_view.dart';
import '../explore/explore_view.dart';

import '../profile/profile_view.dart';
import '../home/home_controller.dart';
import '../calendar/calendar_controller.dart';
import '../explore/explore_controller.dart';
import '../settings/settings_controller.dart';
import '../profile/profile_controller.dart';
import '../search/search_controller.dart';
import 'dashboard_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<CalendarController>(() => CalendarController());
    Get.lazyPut<ExploreController>(() => ExploreController());
    Get.lazyPut<SettingsController>(() => SettingsController());
    Get.lazyPut<ProfileController>(() => ProfileController());
    Get.lazyPut<SearchController>(() => SearchController());
    // FavoritesController is registered as a permanent singleton in global.dart
  }
}

/// The 5 actual pages for the IndexedStack
const _pages = [
  HomeView(),
  CalendarView(),
  ExploreView(), // Renamed to "Explore" in UI, retaining full feature set
  ProfileView(),
];

class DashboardView extends GetView<DashboardController> {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      extendBody: true, // Body goes behind bottom nav
      body: Obx(
        () => IndexedStack(
          index: controller.currentIndex.value,
          children: _pages,
        ),
      ),
      bottomNavigationBar: Obx(
        () => _buildBottomNav(context, isDark, colorScheme),
      ),
    );
  }

  Widget _buildBottomNav(
    BuildContext context,
    bool isDark,
    ColorScheme colorScheme,
  ) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final navBgColor = isDark
        ? AppColors.surfaceDark.withValues(alpha: 0.75)
        : colorScheme.surface.withValues(alpha: 0.85);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.1)
        : Colors.black.withValues(alpha: 0.08);

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: EdgeInsets.only(bottom: bottomPadding, top: 4),
          decoration: BoxDecoration(
            color: navBgColor,
            border: Border(top: BorderSide(color: borderColor, width: 0.5)),
          ),
          child: Row(
            children: [
              Expanded(
                child: _buildNavItem(
                  index: 0,
                  icon: LucideIcons.house,
                  label: 'home'.tr,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 1,
                  icon: LucideIcons.calendar,
                  label: 'events'.tr,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 2,
                  icon: LucideIcons.sparkles,
                  label: 'explore'.tr,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 3,
                  icon: LucideIcons.user,
                  label: 'profile'.tr,
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
    bool isDark = true,
  }) {
    final isSelected = controller.currentIndex.value == index;
    final unselectedColor = isDark ? Colors.white38 : Colors.black38;
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        controller.changePage(index);
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.15)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 24,
              color: isSelected ? AppColors.primary : unselectedColor,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: AppTextStyles.labelSmall.copyWith(
                color: isSelected ? AppColors.primary : unselectedColor,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
