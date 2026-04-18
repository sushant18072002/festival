import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../profile_controller.dart';

class AvatarSelectorSheet extends StatelessWidget {
  final ProfileController controller;

  const AvatarSelectorSheet({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      maxChildSize: 0.9,
      minChildSize: 0.5,
      builder: (_, scrollController) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceGlass(context) : AppColors.surfaceLight,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          padding: const EdgeInsets.only(top: 24, left: 16, right: 16),
          child: Column(
            children: [
              // Drag handle
              Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.glassBorder(context),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                'Choose Your Avatar',
                style: AppTextStyles.headlineMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Unlock more by earning Karma!',
                style: AppTextStyles.bodyMedium(context).copyWith(
                  color: AppColors.accentAdaptive(context),
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: Obx(() {
                  if (controller.avatarGroups.isEmpty) {
                    return const SizedBox.shrink();
                  }
                  return ListView.builder(
                    controller: scrollController,
                    physics: const BouncingScrollPhysics(),
                    padding: EdgeInsets.only(
                      bottom: MediaQuery.of(context).padding.bottom + 16,
                    ),
                    itemCount: controller.avatarGroups.length,
                    itemBuilder: (context, index) {
                      final rawName = controller.avatarGroups.keys.elementAt(
                        index,
                      );
                      final titleParts = rawName.split('|');
                      final groupName = titleParts[0];
                      final requiredKarma = titleParts.length > 1
                          ? int.tryParse(titleParts[1]) ?? (index * 100)
                          : (index * 100);

                      final avatars = controller.avatarGroups[rawName]!;
                      final isLocked =
                          controller.karmaPoints.value < requiredKarma;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Row(
                              children: [
                                Text(
                                  groupName,
                                  style: AppTextStyles.titleMedium(context).copyWith(
                                    color: isLocked
                                        ? AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.5)
                                        : AppColors.primaryAdaptive(context),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (isLocked) ...[
                                  const SizedBox(width: 8),
                                  Icon(
                                    LucideIcons.lock,
                                    size: 16,
                                    color: AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.5),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          Wrap(
                            spacing: 16,
                            runSpacing: 16,
                            children: avatars.map((avatar) {
                              return Obx(() {
                                final isSelected =
                                    controller.selectedAvatar.value == avatar;
                                return GestureDetector(
                                  onTap: () {
                                    if (isLocked) {
                                      HapticFeedback.heavyImpact();
                                      Get.snackbar(
                                        'Avatar Locked',
                                        'Earn more Karma to unlock this tier!',
                                        backgroundColor: AppColors.surfaceGlass(context),
                                        colorText: AppColors.textAdaptive(context),
                                        snackPosition: SnackPosition.BOTTOM,
                                        margin: const EdgeInsets.all(16),
                                        borderRadius: 14,
                                      );
                                    } else {
                                      HapticFeedback.lightImpact();
                                      controller.setAvatar(avatar);
                                      Get.back();
                                    }
                                  },
                                  child: Container(
                                    width: 70,
                                    height: 70,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      // Added a solid background to fix the transparent asset issue
                                      color: isLocked
                                          ? AppColors.textAdaptive(context).withValues(alpha: 0.05)
                                          : (isDark 
                                              ? Colors.white.withValues(alpha: 0.08)
                                              : Colors.black.withValues(alpha: 0.03)),
                                      border: Border.all(
                                        color: isSelected
                                            ? AppColors.accentAdaptive(context)
                                            : (isLocked
                                                  ? Colors.transparent
                                                  : AppColors.textAdaptive(context).withValues(alpha: 0.15)),
                                        width: isSelected ? 3 : 1.5,
                                      ),
                                      boxShadow: [
                                        if (isSelected)
                                          BoxShadow(
                                            color: AppColors.accentAdaptive(context)
                                                .withValues(alpha: 0.6),
                                            blurRadius: 15,
                                            spreadRadius: 2,
                                          ),
                                        // Subtle shadow for non-selected too for depth
                                        if (!isLocked)
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.1),
                                            blurRadius: 4,
                                            offset: const Offset(0, 2),
                                          ),
                                      ],
                                    ),
                                    child: Opacity(
                                      opacity: isLocked ? 0.3 : 1.0,
                                      child: Padding(
                                        padding: const EdgeInsets.all(4.0), // Small padding so avatar stays inside border
                                        child: ClipOval(
                                          child: Image.asset(
                                            avatar,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              });
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ],
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        );
      },
    );
  }
}
