import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'profile_controller.dart';
// Removed unused routes import
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
    return NeoScaffold(
      appBar: AppBar(
        title: const Text('My Journey'),
        backgroundColor: Colors.transparent,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Get.back(),
        ),
      ),
      body: Obx(() {
        final selectedAvatar = controller.selectedAvatar.value;

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppSpacing.verticalXl,
              // 1. Avatar Section
              Center(
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    _showAvatarSelector(context);
                  },
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.surfaceLight,
                          border: Border.all(
                            color: AppColors.primary,
                            width: 3,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.6),
                              blurRadius: 30,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(selectedAvatar, fit: BoxFit.cover),
                        ),
                      ).animate().scale(
                        curve: Curves.easeOutBack,
                        duration: 600.ms,
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.edit,
                            color: Colors.black,
                            size: 16,
                          ),
                        ).animate(delay: 400.ms).fade().scale(),
                      ),
                    ],
                  ),
                ),
              ),

              AppSpacing.verticalXl,

              // 2. Rank & Progress Bar
              KarmaProgressSection(controller: controller),

              AppSpacing.verticalXl,

              // 3. Stats Grid
              Row(
                children: [
                  Expanded(
                    child: ProfileStatCard(
                      icon: Icons.local_fire_department_rounded,
                      title: 'Streak',
                      value: '${controller.currentStreak.value}',
                      delay: 400,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: ProfileStatCard(
                      icon: Icons.emoji_events_rounded,
                      title: 'Karma',
                      value: '${controller.karmaPoints.value}',
                      delay: 500,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: ProfileStatCard(
                      icon: Icons.celebration_rounded,
                      title: 'Festivals',
                      value: '${controller.festivalsExplored.value}',
                      delay: 600,
                    ),
                  ),
                ],
              ),

              AppSpacing.verticalXl,

              // 4. Streak Tracker
              GlassContainer(
                borderRadius: BorderRadius.circular(20),
                padding: const EdgeInsets.all(20),
                color: AppColors.surfaceGlass,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orangeAccent.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.local_fire_department_rounded,
                        color: Colors.orangeAccent,
                        size: 32,
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${controller.currentStreak.value} Day Streak',
                            style: AppTextStyles.headlineMedium.copyWith(
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Come back tomorrow to keep it alive!',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate(delay: 700.ms).fade().slideY(begin: 0.1),

              AppSpacing.verticalXl,

              // 5. Trophy Case
              Row(
                children: [
                  const Icon(Icons.emoji_events_rounded, color: Colors.amber),
                  const SizedBox(width: 8),
                  Text(
                    'Trophy Case',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ],
              ).animate(delay: 800.ms).fade(),

              const SizedBox(height: 16),

              TrophyGrid(controller: controller),

              AppSpacing.verticalXl,
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
      builder: (context) {
        return AvatarSelectorSheet(controller: controller);
      },
    );
  }
}
