import 'dart:ui';
import 'package:flutter/material.dart' hide SearchController;
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
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
import '../../data/services/ambient_audio_service.dart';
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
      body: Stack(
        children: [
          Obx(
            () => IndexedStack(
              index: controller.currentIndex.value,
              children: _pages,
            ),
          ),
          
          // --- GLOBAL AUDIO HUD ---
          Positioned(
            right: 20,
            bottom: MediaQuery.of(context).padding.bottom + 80,
            child: _buildAudioHUD(context),
          ),
        ],
      ),
      bottomNavigationBar: Obx(
        () {
          // Reading currentLang.value makes this Obx reactive to language changes,
          // so .tr strings in the bottom nav tabs update when language is switched.
          controller.currentLang.value;
          return _buildBottomNav(context, isDark, colorScheme);
        },
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
        ? AppColors.surfaceDark.withValues(alpha: 0.4) // Reduced from 0.75
        : colorScheme.surface.withValues(alpha: 0.3); // Reduced from 0.85
    final borderColor = AppColors.glassBorder(context);

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20), // Refined blur
        child: Container(
          padding: EdgeInsets.only(bottom: bottomPadding + 4, top: 6),
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
                  context: context,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 1,
                  icon: LucideIcons.calendar,
                  label: 'events'.tr,
                  context: context,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 2,
                  icon: LucideIcons.sparkles,
                  label: 'explore'.tr,
                  context: context,
                  isDark: isDark,
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  index: 3,
                  icon: LucideIcons.user,
                  label: 'profile'.tr,
                  context: context,
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
    required BuildContext context,
    bool isDark = true,
  }) {
    final isSelected = controller.currentIndex.value == index;
    final unselectedColor = AppColors.textAdaptiveSecondary(context);
    
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
              ? AppColors.primaryAdaptive(context).withValues(alpha: 0.15)
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
              color: isSelected ? AppColors.primaryAdaptive(context) : unselectedColor,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: isSelected ? AppColors.primaryAdaptive(context) : unselectedColor,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioHUD(BuildContext context) {
    final audio = AmbientAudioService.to;

    return Obx(() {
      final isPlaying = audio.isPlaying.value;
      final hasError = audio.hasError.value;
      final currentTitle = audio.currentTitle.value;

      // Only show if audio is active or was recently active
      if (audio.currentEventSlug.isEmpty && !isPlaying) {
        return const SizedBox.shrink();
      }

      return GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          if (isPlaying) {
            audio.stop();
          } else {
            // Logic to resume or re-trigger if needed
            // For now, simple stop/start toggle
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.surfaceGlass(context),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppColors.glassBorder(context)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isPlaying)
                const Icon(
                  LucideIcons.music,
                  size: 16,
                  color: AppColors.primary,
                ).animate(onPlay: (c) => c.repeat()).shimmer(
                      duration: const Duration(seconds: 2),
                    ),
              if (isPlaying) const SizedBox(width: 8),
              Text(
                hasError ? 'Audio Error' : currentTitle,
                style: AppTextStyles.labelSmall(context).copyWith(
                  color: AppColors.textAdaptive(context),
                  fontWeight: FontWeight.w600,
                  fontSize: 11,
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                isPlaying ? LucideIcons.volume2 : LucideIcons.volumeX,
                size: 18,
                color: isPlaying ? AppColors.primary : Colors.grey,
              ),
            ],
          ),
        ).animate().fadeIn().scale(begin: const Offset(0.8, 0.8)),
      );
    });
  }
}
