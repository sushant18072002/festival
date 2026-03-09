import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../home/home_controller.dart';
import '../../profile/profile_controller.dart';

class HomeGreetingTitles extends StatelessWidget {
  final HomeController controller;

  const HomeGreetingTitles({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // In dark mode: white. In light mode: deep purple (readable on light bg).
    final greetingColor = isDark ? Colors.white : const Color(0xFF1A0B2E);

    return Obx(() {
      // Access the observable directly so Obx tracks it and rebuilds on change.
      final greetingText = controller.currentHomeGreeting.value.isNotEmpty
          ? controller.currentHomeGreeting.value
          : controller.timeGreeting;

      final profileController = Get.isRegistered<ProfileController>()
          ? Get.find<ProfileController>()
          : null;

      final bool hasUserName =
          profileController != null &&
          profileController.userName.value.isNotEmpty;

      final String greetingName = hasUserName
          ? profileController.userName.value
          : _getRandomDailyBlessing();

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dynamic greeting — AnimatedSwitcher fades in new text on change
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 600),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position:
                    Tween<Offset>(
                      begin: const Offset(0, 0.1),
                      end: Offset.zero,
                    ).animate(
                      CurvedAnimation(parent: animation, curve: Curves.easeOut),
                    ),
                child: child,
              ),
            ),
            child: Text(
              greetingText,
              key: ValueKey(
                greetingText,
              ), // triggers AnimatedSwitcher on change
              style: AppTextStyles.displayMedium.copyWith(
                color: greetingColor,
                height: 1.1,
              ),
            ),
          ).animate().fade(duration: 800.ms, delay: 200.ms),

          // User name OR Daily Blessing with gradient shader
          ShaderMask(
                shaderCallback: (bounds) =>
                    const LinearGradient(
                      colors: [AppColors.primary, AppColors.secondary],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ).createShader(
                      Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                    ),
                child: Text(
                  greetingName,
                  style: hasUserName
                      ? AppTextStyles.displayMedium.copyWith(
                          // ShaderMask requires white color to show shader
                          color: Colors.white,
                          height: 1.1,
                        )
                      : AppTextStyles.headlineMedium.copyWith(
                          color: Colors.white,
                          fontStyle: FontStyle.italic,
                          height: 1.2,
                        ),
                ),
              )
              .animate()
              .fade(duration: 800.ms, delay: 400.ms)
              .slideX(begin: -0.05),
        ],
      );
    });
  }

  String _getRandomDailyBlessing() {
    return '${'daily_blessing'.tr} ✨';
  }
}
