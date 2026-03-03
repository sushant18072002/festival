import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/glass_container.dart';
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
        return GlassContainer(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          padding: const EdgeInsets.only(top: 24, left: 16, right: 16),
          child: Column(
            children: [
              Text(
                'Choose Your Avatar',
                style: AppTextStyles.headlineMedium.copyWith(
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Unlock more by earning Karma!',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.accent,
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: Obx(() {
                  if (controller.avatarGroups.isEmpty)
                    return const SizedBox.shrink();
                  return ListView.builder(
                    controller: scrollController,
                    physics: const BouncingScrollPhysics(),
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
                                  style: AppTextStyles.titleMedium.copyWith(
                                    color: isLocked
                                        ? Colors.white38
                                        : AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (isLocked) ...[
                                  const SizedBox(width: 8),
                                  const Icon(
                                    Icons.lock_rounded,
                                    size: 16,
                                    color: Colors.white38,
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
                                        backgroundColor: Colors.black87,
                                        colorText: Colors.white,
                                        snackPosition: SnackPosition.BOTTOM,
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
                                      color: isLocked
                                          ? Colors.white10
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: isSelected
                                            ? AppColors.accent
                                            : (isLocked
                                                  ? Colors.transparent
                                                  : Colors.white24),
                                        width: isSelected ? 3 : 1,
                                      ),
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: AppColors.accent
                                                    .withValues(alpha: 0.5),
                                                blurRadius: 10,
                                                spreadRadius: 2,
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Opacity(
                                      opacity: isLocked ? 0.3 : 1.0,
                                      child: ClipOval(
                                        child: Image.asset(
                                          avatar,
                                          fit: BoxFit.cover,
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
