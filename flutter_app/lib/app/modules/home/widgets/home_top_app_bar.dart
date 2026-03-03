import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../routes/app_pages.dart';
import '../../home/home_controller.dart';
import '../../profile/profile_controller.dart';

class HomeTopAppBar extends StatelessWidget {
  final HomeController controller;

  const HomeTopAppBar({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.auto_awesome, size: 12, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Text('UTSAV FESTIVAL', style: AppTextStyles.labelSmall),
        ),
        // Language Dropdown
        Obx(
          () => Container(
            height: 38,
            padding: const EdgeInsets.only(left: 12, right: 6),
            decoration: BoxDecoration(
              color: AppColors.surfaceGlass,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.currentLang.value,
                icon: const Icon(
                  Icons.arrow_drop_down_rounded,
                  color: Colors.white70,
                  size: 20,
                ),
                dropdownColor: AppColors.surfaceDark,
                style: AppTextStyles.labelSmall.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                onChanged: (String? newValue) {
                  if (newValue != null) {
                    HapticFeedback.lightImpact();
                    controller.changeLanguage(newValue);
                  }
                },
                items: const [
                  DropdownMenuItem(value: 'en', child: Text('A/अ EN')),
                  DropdownMenuItem(value: 'hi', child: Text('A/अ HI')),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        // Notification Bell
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            Get.snackbar(
              "No new alerts",
              "You're all caught up!",
              snackPosition: SnackPosition.TOP,
              backgroundColor: Colors.black.withValues(alpha: 0.7),
              colorText: Colors.white,
              margin: const EdgeInsets.all(16),
              borderRadius: 20,
              barBlur: 10,
              icon: const Icon(
                Icons.notifications_none_rounded,
                color: AppColors.accent,
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.surfaceGlass,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: const Icon(
              Icons.notifications_outlined,
              size: 18,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 12),
        // User Profile Avatar
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            Get.toNamed(Routes.PROFILE);
          },
          child: Obx(() {
            if (!Get.isRegistered<ProfileController>()) {
              return const SizedBox.shrink();
            }
            final profileController = Get.find<ProfileController>();
            return Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.asset(
                  profileController.selectedAvatar.value,
                  fit: BoxFit.cover,
                ),
              ),
            );
          }),
        ),
      ],
    ).animate().fade(duration: 800.ms);
  }
}
