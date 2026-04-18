import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../routes/app_pages.dart';
import 'profile_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import 'widgets/avatar_selector_sheet.dart';
import 'widgets/profile_stat_card.dart';
import 'widgets/karma_progress_section.dart';
import 'widgets/trophy_grid.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return NeoScaffold(
      appBar: AppBar(
        title: Text(
          'my_journey'.tr,
          style: AppTextStyles.headlineMedium(
            context,
          ).copyWith(color: AppColors.textAdaptive(context)),
        ),
        backgroundColor: isDark
            ? AppColors.backgroundDark.withValues(alpha: 0.95)
            : AppColors.backgroundLight.withValues(alpha: 0.97),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => Get.back(),
        ),
        actions: [
          IconButton(
            icon: Icon(
              LucideIcons.settings,
              color: AppColors.textAdaptive(context),
            ),
            onPressed: () {
              HapticFeedback.lightImpact();
              Get.toNamed(Routes.settings);
            },
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Obx(() {
        final selectedAvatar = controller.selectedAvatar.value;

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 90),

              // 1. ZEN HERO SECTION (Compact)
              Center(
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        _showAvatarSelector(context);
                      },
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.surfaceGlass(context),
                              border: Border.all(
                                color: AppColors.primaryAdaptive(context),
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primaryAdaptive(
                                    context,
                                  ).withValues(alpha: 0.25),
                                  blurRadius: 30,
                                  spreadRadius: -5,
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                selectedAvatar,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ).animate().scale(
                            curve: Curves.easeOutBack,
                            duration: 600.ms,
                          ),
                          Positioned(
                            bottom: 2,
                            right: 2,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: AppColors.accentAdaptive(context),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.2),
                                    blurRadius: 10,
                                  ),
                                ],
                              ),
                              child: Icon(
                                LucideIcons.pencil,
                                color: Colors.white,
                                size: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 2. PROGRESSION HERO
              KarmaProgressSection(controller: controller),

              const SizedBox(height: 20),

              // 3. STATS BENTO GRID (High Density)
              Row(
                children: [
                  Expanded(
                    child: ProfileStatCard(
                      icon: LucideIcons.flame,
                      title: 'streak'.tr,
                      value: '${controller.currentStreak.value}',
                      accentColor: const Color(0xFFF59E0B),
                      delay: 400,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ProfileStatCard(
                      icon: LucideIcons.trophy,
                      title: 'karma'.tr,
                      value: '${controller.karmaPoints.value}',
                      accentColor: AppColors.primaryAdaptive(context),
                      delay: 500,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ProfileStatCard(
                      icon: LucideIcons.partyPopper,
                      title: 'explored'.tr,
                      value: '${controller.festivalsExplored.value}',
                      accentColor: const Color(0xFF8B5CF6),
                      delay: 600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // 4. LANDSCAPE BENTO: STREAK TRACKER (Compact)
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceGlass(context),
                  borderRadius: BorderRadius.circular(24),
                  border: AppColors.adaptiveBorder(context),
                  boxShadow: AppColors.glassShadow(context),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        LucideIcons.flame,
                        color: Color(0xFFF59E0B),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${controller.currentStreak.value} ${'day_streak'.tr}',
                            style: AppTextStyles.titleMedium(context).copyWith(
                              color: AppColors.textAdaptive(context),
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'come_back_tomorrow'.tr,
                            style: AppTextStyles.labelSmall(context).copyWith(
                              color: AppColors.textAdaptiveSecondary(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 700.ms).fade().slideY(begin: 0.1),

              const SizedBox(height: 24),

              // 5. TROPHY CASE
              TrophyGrid(controller: controller),

              const SizedBox(height: 100),
            ],
          ),
        );
      }),
    );
  }

  void _showAvatarSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      elevation: 0,
      barrierColor: Colors.black.withValues(alpha: 0.1), // Subtle shadow mask
      builder: (context) {
        return AvatarSelectorSheet(controller: controller);
      },
    );
  }
}
